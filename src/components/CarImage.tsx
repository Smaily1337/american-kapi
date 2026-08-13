"use client";

import Image from "next/image";
import { useState } from "react";

export const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80";

type Props = {
  src?: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function CarImage({ src, alt, fill, className, sizes, priority }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const current = !src || failedSrc === src ? FALLBACK_CAR_IMAGE : src;
  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={current.includes("copart.com")}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}
