import { ReactNode } from 'react';
import { useLivekitToken } from '../hooks/useLivekitToken';

type CallPropsT = {
  firstId: string;
  secondId: string;
  children: ReactNode;
};

export const CallProvider = ({ firstId, secondId, children }: CallPropsT) => {
  const { token = '123' } = useLivekitToken(firstId, secondId);

  if (!token) {
    return (
      <div className="bg-gray-0 flex h-full w-full flex-col">
        <div className="flex h-full flex-auto flex-col items-center justify-center p-4 md:p-5">
          <div className="flex h-full justify-center">
            <div
              className="text-brand-80 inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
