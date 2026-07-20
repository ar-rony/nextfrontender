"use client";

import { useEffect, useState } from "react";

export default function ProjectImageLightboxClient({ images = [], title }: { images?: string[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
      if (e.key === "ArrowRight") setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {images.map((src, i) => (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <img
            key={i}
            src={src}
            alt={`${title ?? "Project"}-${i}`}
            className="rounded-lg w-full cursor-pointer"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          />
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-0 top-0 m-2 rounded bg-black/60 px-3 py-1 text-white"
            >
              Close
            </button>

            <img src={images[index]} alt={`${title ?? "Project"}-${index}`} className="max-h-[80vh] w-full object-contain rounded" />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-black/60 px-3 py-2 text-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-black/60 px-3 py-2 text-white"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
