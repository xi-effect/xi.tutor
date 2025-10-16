import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp } from '@xipkg/icons';
import { Button } from '@xipkg/button';

import { type RoleT } from 'common.types';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { useNavigate } from '@tanstack/react-router';

export const DrawerRoleSelector = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const handleRoleChange = (value: RoleT) => {
    updateProfile.mutate(
      { default_layout: value },
      {
        onSuccess: () => {
          navigate({ to: '/' });
          setIsExpanded(false);
        },
      },
    );
  };

  const getCurrentRoleText = () => {
    if (user?.default_layout === 'tutor') return t('tutor');
    if (user?.default_layout === 'student') return t('student');
    return t('role');
  };

  const getCurrentRoleIcon = () => {
    return isExpanded ? (
      <ChevronUp className="text-gray-60 h-4 w-4" />
    ) : (
      <ChevronUp className="text-gray-60 h-4 w-4 rotate-180" />
    );
  };

  return (
    <div className="w-full">
      <Button
        variant="secondary"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-gray-80 text-m-base flex w-full items-center justify-between"
      >
        <span>{getCurrentRoleText()}</span>
        {getCurrentRoleIcon()}
      </Button>

      {isExpanded && (
        <div className="mt-2 flex flex-col gap-2 space-y-1">
          <Button
            variant="secondary"
            onClick={() => handleRoleChange('tutor')}
            className={`text-gray-80 text-m-base justify-start ${
              user?.default_layout === 'tutor' ? 'bg-brand-40 text-gray-100' : ''
            }`}
          >
            {t('tutor')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleRoleChange('student')}
            className={`text-gray-80 text-m-base justify-start ${
              user?.default_layout === 'student' ? 'bg-brand-40 text-gray-100' : ''
            }`}
          >
            {t('student')}
          </Button>
        </div>
      )}
    </div>
  );
};
