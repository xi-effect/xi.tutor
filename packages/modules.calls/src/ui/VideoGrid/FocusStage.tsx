import React from 'react';

interface FocusStageProps {
  children: React.ReactNode;
  className?: string;
}

export function FocusStage({ children, className = '' }: FocusStageProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{ containerType: 'size' }}
    >
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          width: 'min(100cqw, calc(100cqh * 16 / 9))',
          aspectRatio: '16 / 9',
        }}
      >
        <div className="relative h-full w-full">{children}</div>
      </div>
    </div>
  );
}
