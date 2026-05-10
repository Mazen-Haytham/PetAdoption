// src/components/ListPet/Toast.jsx
import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-20 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border max-w-sm animate-slide-in
        ${isSuccess
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
        }`}
    >
      {isSuccess
        ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      }
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
