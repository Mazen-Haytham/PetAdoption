import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "../../api/api";

function LogoutBtn() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch {
      // nothing to do here
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      className="hover:cursor-pointer w-full rounded-2xl transition-all border-2 text-red-500 hover:bg-red-500 px-5 py-2 text-sm font-extrabold hover:text-white hover:border-transparent hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-50"
      onClick={handleLogout}
    >
      <LogOut />
      <span>{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}

export default LogoutBtn;