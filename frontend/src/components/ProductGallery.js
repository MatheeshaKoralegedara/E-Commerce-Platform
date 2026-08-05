'use client';

import { useState } from 'react';

export default function ProductGallery({ mainImage, gallery = [] }) {
  const allImages = [
    ...(mainImage ? [{ image_url: mainImage }] : []),
    ...gallery,
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-[var(--color-line)]/40 rounded-md flex items-center justify-center text-[var(--color-muted)] text-sm">
        No image
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square bg-[var(--color-line)]/40 rounded-md overflow-hidden mb-3">
        <img src={allImages[activeIndex].image_url} alt="" className="w-full h-full object-cover" />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex}
              className="w-16 h-16 rounded overflow-hidden border-2 transition-colors"
              style={{ borderColor: i === activeIndex ? 'var(--color-ink)' : 'var(--color-line)' }}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}