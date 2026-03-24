export default function ScoreBar({ label, score, max = 10 }) {
  const pct = Math.min((score / max) * 100, 100);
  const color =
    score >= 7
      ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
      : score >= 5
      ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
      : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]';

  const textColor =
    score >= 7
      ? 'text-green-400'
      : score >= 5
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="flex flex-col gap-1.5 bg-dark/30 p-4 rounded-xl border border-white/5">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
        <span className="text-white/70 font-medium">{label}</span>
        <span className={`font-semibold ${textColor}`}>
          {score !== null && score !== undefined ? `${score}/${max}` : 'N/A'}
        </span>
      </div>
      <div className="w-full bg-darker border border-white/10 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${score !== null && score !== undefined ? pct : 0}%` }}
        ></div>
      </div>
    </div>
  );
}
