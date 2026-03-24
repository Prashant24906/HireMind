import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Camera, Mic, MicOff, Video, VideoOff, Send, RotateCcw } from 'lucide-react';

export default function LiveInterviewSession() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Video/Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');

  // Confidence metrics
  const [confidenceMetrics, setConfidenceMetrics] = useState({
    clarity: 0,
    pace: 0,
    filler_words: 0,
    overall: 0
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fetch interview
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await api.get(`/interview/${interviewId}`);
        if (data.interview.status === 'completed') {
          navigate(`/result/${interviewId}`, { replace: true });
          return;
        }
        setInterview(data.interview);
        const firstUnanswered = data.interview.questions.findIndex(q => !q.answerText);
        setCurrentIdx(firstUnanswered >= 0 ? firstUnanswered : 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [interviewId, navigate]);

  // Initialize camera and speech recognition
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Start media recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();

      // Start speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + ' ' + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Camera/mic access denied:', err);
      alert('Please allow camera and microphone access');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    // Stop video/audio
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Calculate confidence metrics
    analyzeConfidence();

    // Submit answer with metrics
    const question = interview.questions[currentIdx];
    try {
      const { data } = await api.post('/interview/answer', {
        interviewId,
        questionId: question.questionId,
        answerText: transcript,
        confidenceMetrics,
      });

      // Move to next question
      if (currentIdx < interview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setTranscript('');
        setConfidenceMetrics({ clarity: 0, pace: 0, filler_words: 0, overall: 0 });
      } else {
        navigate(`/result/${interviewId}`);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  const analyzeConfidence = () => {
    const text = transcript.toLowerCase();
    const words = text.split(' ');

    // Filler words detection
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally'];
    let fillerCount = 0;
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      fillerCount += (text.match(regex) || []).length;
    });

    // Clarity (words > 10 and complete sentences)
    const clarity = text.includes('.') && words.length > 10 ? 85 : 60;

    // Pace (word count / duration estimate)
    const pace = words.length > 50 ? 80 : words.length > 20 ? 70 : 50;

    // Filler words score
    const fillerScore = Math.max(0, 100 - (fillerCount * 10));

    // Overall
    const overall = (clarity + pace + fillerScore) / 3;

    setConfidenceMetrics({
      clarity: Math.round(clarity),
      pace: Math.round(pace),
      filler_words: Math.round(fillerScore),
      overall: Math.round(overall)
    });
  };

  if (loading) return <div className="p-8 text-center">Loading interview...</div>;
  if (!interview) return null;

  const question = interview.questions[currentIdx];
  const totalQuestions = interview.questions.filter(q => !q.isFollowUp).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold mb-4">
              Question {currentIdx + 1} of {totalQuestions}
            </h2>
            <p className="text-gray-700 mb-6">{question?.questionText}</p>
            
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              📸 Speak clearly, maintain eye contact, and answer fully
            </div>
          </div>
        </div>

        {/* Video & Recording */}
        <div className="lg:col-span-2">
          {/* Video feed */}
          <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                videoEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              Video
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                audioEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              Microphone
            </button>

            <button
              onClick={() => setTranscript('')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 transition"
            >
              <RotateCcw size={20} />
              Clear
            </button>
          </div>

          {/* Transcript */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <h3 className="font-semibold mb-2">Your Response:</h3>
            <p className="text-gray-700 min-h-24 p-3 bg-gray-50 rounded">
              {transcript || 'Your transcript will appear here...'}
            </p>
          </div>

          {/* Confidence Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard label="Clarity" value={confidenceMetrics.clarity} />
            <MetricCard label="Pace" value={confidenceMetrics.pace} />
            <MetricCard label="Filler Words" value={confidenceMetrics.filler_words} />
            <MetricCard label="Overall" value={confidenceMetrics.overall} />
          </div>

          {/* Recording button */}
          <div className="flex gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Video size={20} />
                  Stop & Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  const getColor = (v) => {
    if (v >= 80) return 'text-green-600';
    if (v >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${getColor(value)}`}>{value}</p>
    </div>
  );
}