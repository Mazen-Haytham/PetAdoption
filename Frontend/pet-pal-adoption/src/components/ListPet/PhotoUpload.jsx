// src/components/ListPet/PhotoUpload.jsx
import { useRef } from "react";
import { ImageIcon, UploadCloud, X } from "lucide-react";

export default function PhotoUpload({ images, onChange }) {
  const inputRef = useRef(null);
  const MAX = 4;

  const handleFiles = (files) => {
    const incoming = Array.from(files).filter((f) =>
      ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(f.type)
    );
    const combined = [...images, ...incoming].slice(0, MAX);
    onChange(combined);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const previews = images.map((f) => URL.createObjectURL(f));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-indigo-500" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">Photos</h2>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-4"
      >
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-indigo-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">Upload high-quality images</p>
          <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: MAX }).map((_, i) => {
          const src = previews[i];
          return src ? (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={src} alt={`pet-${i}`} className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] font-semibold bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">
                  Main
                </span>
              )}
            </div>
          ) : (
            <button
              key={i}
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-center text-slate-300 hover:text-indigo-400"
            >
              <span className="text-xl font-light">+</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
