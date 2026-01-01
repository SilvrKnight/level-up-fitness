import { useState, useEffect } from 'react';

const STORAGE_KEY = 'deepseek_api_key';

export const useDeepSeekKey = () => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    setApiKeyState(stored);
    setIsLoading(false);
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState(null);
  };

  const hasApiKey = !!apiKey;

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasApiKey,
    isLoading,
  };
};
