import { useState, useTransition } from 'react';
import { useNavigate } from '@tanstack/react-router';

// Временно, пока не реализована интеграция с бэкендом
export const useWelcomeSocialsForm = () => {
  const [isPending] = useTransition();
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  const onWelcomeSocialsForm = () => {
    navigate({
      to: '/',
    });
  };

  return { onWelcomeSocialsForm, isPending, error };
};
