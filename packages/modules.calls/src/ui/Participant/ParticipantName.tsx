import React from 'react';
import { useUserById } from 'common.services';

type ParticipantNamePropsT = {
  id: string | undefined;
  username: string | undefined;
  children?: React.ReactNode;
};

export const ParticipantName = ({ id, username, children }: ParticipantNamePropsT) => {
  const { data, isLoading } = useUserById(id ?? '', !id);

  if (isLoading || !id) {
    return <span className="bg-gray-10 h-[16px] w-full min-w-[64px] animate-pulse rounded-[4px]" />;
  }

  return (
    <span className="text-[12px] leading-[16px] text-gray-100">
      {children}
      {data?.display_name ?? username}
    </span>
  );
};
