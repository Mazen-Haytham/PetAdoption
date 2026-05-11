// components/LogoutButton.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logout } from "../api/api";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Logout failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
    >
      <LogOut size={18} />
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}