import { useState, useCallback } from 'react';
import { generatePlaylist } from '../api/playlistApi';
import type { PlaylistResponse } from '../types';

export function usePlaylist() {
  const [result, setResult] = useState<PlaylistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (imageBase64: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generatePlaylist({ imageBase64 });
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, generate, reset };
}
