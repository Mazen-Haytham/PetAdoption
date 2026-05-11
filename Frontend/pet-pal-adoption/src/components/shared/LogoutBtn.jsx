import { LogOut } from "lucide-react";
import { logout } from "../../api/api";
import { useNavigate } from "react-router-dom";
function LogoutBtn() {
    const navigate = useNavigate();
    const postLogout = async () => {
        await logout();
        navigate("/login");
    };
    return ( 
    <button
        type="button"
        className="hover:cursor-pointer w-full rounded-2xl transition-all border-2 text-red-500 hover:bg-red-500 px-5 py-2 text-sm font-extrabold hover:text-white hover:border-transparent hover:brightness-95 flex items-center justify-center gap-2"
        onClick={postLogout}
    >
        <LogOut />
        <span>Logout</span>
    </button>
    );
}

export default LogoutBtn;