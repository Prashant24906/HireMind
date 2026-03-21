export default function ScoreBar({ label, score, max = 10 }) {
  const pct = Math.min((score / max) * 100, 100);
  const color =
    score >= 7
      ? 'bg-green-500'
      : score >= 5
      ? 'bg-yellow-500'
      : 'bg-red-500';

  const textColor =
    score >= 7
      ? 'text-green-600'
      : score >= 5
      ? 'text-yellow-600'
      : 'text-red-500';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-semibold ${textColor}`}>
          {score !== null && score !== undefined ? `${score}/${max}` : 'N/A'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score !== null && score !== undefined ? pct : 0}%` }}
        ></div>
      </div>
    </div>
  );
}
