/** Same outer width/padding as owner admin-style pages. */
export default function AdminPageShell({ children }) {
  return <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>;
}
