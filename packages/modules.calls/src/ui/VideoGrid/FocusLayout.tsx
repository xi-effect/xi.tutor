import React from 'react';
import { PagedCarousel } from './PagedCarousel';

interface FocusLayoutProps {
  focus: React.ReactNode;
  thumbs: React.ReactNode[];
  className?: string;
}

export function FocusLayout({ focus, thumbs, className = '' }: FocusLayoutProps) {
  return (
    <div className={`flex h-full w-full flex-col gap-2 ${className}`}>
      <div className="w-full shrink-0 [&_.lk-participant-tile]:rounded-none">
        <div className="aspect-video w-full">{focus}</div>
      </div>

      {thumbs.length > 0 && (
        <div className="min-h-0 flex-1 px-1">
          <PagedCarousel
            items={thumbs}
            orientation="vertical"
            aspectRatio={16 / 9}
            minItemSize={120}
            maxItemSize={200}
            renderItem={(node) => (
              <div className="relative h-full w-full">
                <div className="absolute inset-0">{node}</div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
