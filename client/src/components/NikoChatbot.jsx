import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function NikoChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! I'm NIKO 🤖 Your friendly HireMind guide! Ask me anything! (Try: 'how to apply', 'interview', 'scoring')",
      sender: 'niko',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  // NIKO's knowledge base
  const nikoKnowledge = {
    'how to apply': {
      response: "Finding a job? 🔍 Just click 'Browse Jobs' → 'Apply' → Done! 💼 Then you'll get an interview slot. Easy peasy! 😎"
    },
    'interview process': {
      response: "Our interview flow: 🎤 Answer 10 questions → 📊 AI scores you → 🔄 Get follow-ups → 📈 View detailed results! Super transparent! 🎯"
    },
    'post a job': {
      response: "Interviewer mode? 💼 Go to 'Create Job' → Fill job details → Post! 🚀 Then candidates will apply like crazy! You'll see their AI interview scores! 📊"
    },
    'scoring': {
      response: "Our AI (powered by GROQ LLM) 🧠 scores based on: Accuracy 📍 | Depth 🔍 | Clarity 💬 | Application 🔧 | Critical Thinking 🤔 Each out of 10! Fair & Fast! ⚡"
    },
    'confidence': {
      response: "Confidence is judged by how clearly you explain concepts! 💪 Speak clearly, structure your thoughts, & show enthusiasm! You got this! 🌟"
    },
    'what is hiremind': {
      response: "HireMind is an AI-powered recruitment platform! 🚀 Candidates take AI interviews, get scored, ranked! Interviewers post jobs & hire the best! 💼 No bias, pure skill-based hiring! ✨"
    },
    'features': {
      response: "We have: 📋 AI Interview Questions, 💬 NIKO Chatbot (that's me!), 📊 Detailed Scoring, 🎥 Live Interview Mode (coming soon!), 🏆 Candidate Rankings! Epic stuff! 🔥"
    },
    'live interview': {
      response: "Soon! 🎥 Live interview mode will have video/audio streaming, real-time AI questions, confidence analysis, and instant feedback! Stay tuned! 🚀"
    },
    'questions': {
      response: "We have 10 questions per interview! 📝 Mix of: MCQ (Multiple Choice) 🎯 | Theory Questions 📚 | Difficulty levels: Easy → Medium → Hard 🎪 Keeps it interesting!"
    },
    'jobs available': {
      response: "We have tons of job roles! 💼 Software Engineer, ML Engineer, Data Scientist, Full Stack Dev, Frontend, Backend, DevOps, and more! 🌟 Check 'Browse Jobs'! 👀"
    },
    'help': {
      response: "I can help with: 💬 How to use HireMind | 📋 Interview process | 🎯 Scoring system | 💼 Job posting | 🎓 Tips for interviews! Just ask me anything! 😄"
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Show typing indicator
    setTyping(true);

    // Get NIKO response
    setTimeout(() => {
      const userInput = input.toLowerCase();
      let response = "Hmm, that's a great question! 🤔 I'm still learning... Try asking about: interview, scoring, jobs, or how to apply! 😅";

      // Search for matching response
      for (const [key, value] of Object.entries(nikoKnowledge)) {
        if (userInput.includes(key)) {
          response = value.response;
          break;
        }
      }

      const nikoMsg = {
        id: messages.length + 2,
        text: response,
        sender: 'niko',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, nikoMsg]);
      setTyping(false);
    }, 800);

    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 bg-white rounded-2xl shadow-2xl mb-4 flex flex-col max-h-[500px] border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h3 className="font-bold text-lg">NIKO</h3>
                <p className="text-xs text-blue-100">Always happy to help!</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-blue-700 p-2 rounded-lg transition"
              title="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
              >
                <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none shadow-md'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none shadow-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-none shadow-md">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask NIKO anything..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || typing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full p-4 shadow-2xl transition transform hover:scale-110 duration-200 relative"
        title="Open NIKO Chat"
      >
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            ?
          </div>
        )}
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
