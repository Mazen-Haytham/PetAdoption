export default function ErrorMessage({ error }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
      <span className="text-red-500">⚠</span>
      <span>{error}</span>
    </div>
  );
}