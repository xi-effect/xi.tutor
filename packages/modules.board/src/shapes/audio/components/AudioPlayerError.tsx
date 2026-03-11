type AudioPlayerErrorProps = {
  message: string;
};

export function AudioPlayerError({ message }: AudioPlayerErrorProps) {
  return (
    <div
      style={{ pointerEvents: 'none' }}
      className="text-gray-40 flex h-full w-full items-center justify-center gap-2 px-4"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-30">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M15 9l-6 6M9 9l6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs">{message}</span>
    </div>
  );
}
