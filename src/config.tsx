import React, { useState, useEffect } from 'react';

type Config = {
  apiUrl: string;
  mode: string;
};

const useConfig = (): Config | null => {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Проверка для SSR

    fetch('/config')
    .then((res) => {
      if (!res.ok) {
        throw new Error('Не удалось загрузить конфигурацию');
      }
      return res.json();
    })
    .then((data) => setConfig(data))
    .catch((err) => {
      console.error('Ошибка при загрузке конфигурации:', err);
      setError(err.message);
    });
  }, []);

  if (error) {
    console.error('Ошибка:', error);
  }

  return config;
};

const ConfigComponent = () => {
  const config = useConfig();

  if (config === null) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
    <p>API URL: {config.apiUrl}</p>
    <p>Mode: {config.mode}</p>
    </div>
  );
};


export default ConfigComponent;
