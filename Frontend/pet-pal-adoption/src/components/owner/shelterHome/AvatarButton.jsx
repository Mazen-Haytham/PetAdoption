import React from "react";

export default function AvatarButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-3 rounded-full bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/5 hover:bg-black/5"
      aria-label="Account"
    >
      <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-black/10">
        <img
          alt="User avatar"
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
        />
      </div>
    </button>
  );
}

