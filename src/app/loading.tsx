export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-blue-400 font-medium animate-pulse">Loading Tic-Tac-Toe...</p>
      </div>
    </div>
  );
}
