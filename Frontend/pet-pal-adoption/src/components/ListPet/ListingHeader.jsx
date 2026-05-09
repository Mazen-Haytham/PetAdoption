// src/components/ListPet/ListingHeader.jsx
import { PawPrint } from "lucide-react";

export default function ListingHeader({ onCancel, onPublish, isPublishing }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">List a Pet</p>
            <p className="text-xs text-indigo-500 font-medium leading-tight">Shelter Portal</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </header>
  );
}
