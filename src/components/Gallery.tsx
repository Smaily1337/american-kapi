"use client";

import { useState } from "react";
import { CarImage, FALLBACK_CAR_IMAGE } from "@/components/CarImage";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const photos = images.length ? images : [FALLBACK_CAR_IMAGE];
  const current = photos[active] ?? photos[0];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#ececec]">
        <CarImage
          src={current}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Poprzednie zdjęcie"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-lg font-bold text-white hover:bg-black/80"
              onClick={() =>
                setActive((index) => (index - 1 + photos.length) % photos.length)
              }
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Następne zdjęcie"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-lg font-bold text-white hover:bg-black/80"
              onClick={() => setActive((index) => (index + 1) % photos.length)}
            >
              ›
            </button>
            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white">
              {active + 1} / {photos.length}
            </div>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 sm:gap-2">
          {photos.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-[4/3] overflow-hidden rounded-md border ${
                active === index ? "border-orange ring-1 ring-orange" : "border-line"
              }`}
            >
              <CarImage src={src} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
