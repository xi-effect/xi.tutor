import { useState, useTransition } from 'react';
import { useNavigate } from '@tanstack/react-router';

// Временно, пока не реализована интеграция с бэкендом
export const useWelcomeAboutForm = () => {
  const [isPending] = useTransition();
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  const onWelcomeAboutForm = () => {
    navigate({
      to: '/welcome/socials',
    });
  };

  return { onWelcomeAboutForm, isPending, error };
};
