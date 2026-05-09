// src/components/ListPet/FormFooter.jsx
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function FormFooter({ onBack, onNext, isSubmitting }) {
  return (
    <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Next Step"}
          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
