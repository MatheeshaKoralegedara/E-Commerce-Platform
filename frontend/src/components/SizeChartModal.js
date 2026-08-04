'use client';

import { useState } from 'react';

export default function SizeChartModal({ imageUrl }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-[var(--color-pine)] underline underline-offset-2"
      >
        Size Chart
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Size chart"
        >
          <div
            className="bg-white rounded-lg p-4 max-w-lg w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Size Chart</h3>
              <button onClick={() => setOpen(false)} aria-label="Close size chart" className="text-[var(--color-muted)] text-xl leading-none">
                &times;
              </button>
            </div>
            <img src={imageUrl} alt="Product size chart" className="w-full rounded" />
          </div>
        </div>
      )}
    </>
  );
}
