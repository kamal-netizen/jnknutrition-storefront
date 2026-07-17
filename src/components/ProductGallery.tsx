"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/queries/products";

type Props = {
  images: ProductImage[];
  title: string;
  activeIndex?: number;
  activeImageUrl?: string | null;
  onActiveChange?: (i: number) => void;
};

export default function ProductGallery({ images, title, activeIndex: controlledIndex, activeImageUrl, onActiveChange }: Props) {
  const [internalIndex, setInternalIndex] = useState(0);
  const active = controlledIndex ?? internalIndex;

  function setActive(i: number) {
    setInternalIndex(i);
    onActiveChange?.(i);
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] flex items-center justify-center">
        <span className="text-6xl font-black text-[#E2E8F0] opacity-40">JNK</span>
      </div>
    );
  }

  const baseImage = images[active] ?? images[0];
  const activeImage = activeImageUrl
    ? { url: activeImageUrl, altText: baseImage.altText }
    : baseImage;

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAFBFC] border border-[#E2E8F0] shadow-card">
        <Image
          src={activeImage.url}
          alt={activeImage.altText ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain p-4"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, i) => (
            <button
              key={image.url}
              onClick={() => setActive(i)}
              className={`relative aspect-square rounded-lg overflow-hidden border transition-colors ${
                i === active
                  ? "border-[#F9D20F] ring-2 ring-[#F9D20F]/30"
                  : "border-[#E2E8F0] hover:border-[#94A3B8]"
              }`}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${title} ${i + 1}`}
                fill
                sizes="20vw"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
