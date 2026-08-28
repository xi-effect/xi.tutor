import { useEffect, useState } from 'react';
import { useGetLibraryFile } from 'common.services';

export const useLibraryFileBlob = (fileId: string | null) => {
  const query = useGetLibraryFile(fileId ?? '', { disabled: !fileId });
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const blob = query.data?.status === 200 ? query.data.data : null;

  useEffect(() => {
    if (!blob) {
      setBlobUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return {
    blob,
    blobUrl,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
};
