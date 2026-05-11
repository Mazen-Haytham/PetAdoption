/** Red banner when an admin API call fails. */
export default function AdminAlertError({ message }) {
  if (!message) return null;
  return (
    <div className="pa-card mt-6 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
      {message}
    </div>
  );
}
