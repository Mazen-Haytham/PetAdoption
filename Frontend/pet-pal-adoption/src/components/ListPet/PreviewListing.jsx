// src/components/ListPet/PreviewListing.jsx
import { Eye, ChevronRight } from "lucide-react";

export default function PreviewListing({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <Eye className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-800">Preview Listing</p>
          <p className="text-xs text-slate-400">See how it looks for adopters</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
    </button>
  );
}
