import { useState, useCallback } from 'react';
import { useSocketEvent, useSocketEmit } from 'common.sockets';
import { isDevMode, devToken } from '../utils/config';

type TokenResponse = {
  status: number;
  data: string;
};

export const useLivekitToken = (communityId: string, channelId: string) => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const emitGenerateToken = useSocketEmit<{ community_id: string; channel_id: string }>(
    'generate-livekit-token',
  );

  const handleToken = useCallback((response: TokenResponse) => {
    if (response.status === 200) {
      setToken(response.data);
      setError(null);
    } else {
      const newError = new Error(`Server Error, ${response.status}`);
      setError(newError);
      setToken(null);
    }
  }, []);

  useSocketEvent<TokenResponse>('generate-livekit-token', handleToken);

  const generateToken = useCallback(() => {
    emitGenerateToken({
      community_id: communityId,
      channel_id: channelId,
    });
  }, [communityId, channelId, emitGenerateToken]);

  return { token: isDevMode ? devToken : token, error, generateToken };
};
