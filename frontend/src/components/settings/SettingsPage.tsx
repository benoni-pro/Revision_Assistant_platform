import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import aiService from '../../services/aiService';

type Provider = 'ollama' | 'openai' | 'none';

interface ProviderModels {
  providers: {
    ollama: { available: boolean; models: string[] };
    openai: { available: boolean; models: string[] };
  };
  defaults: { provider: Provider; model: string };
}

const STORAGE_KEY = 'aiProviderSelection';

const SettingsPage: React.FC = () => {
  const { theme, toggle } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [modelsInfo, setModelsInfo] = useState<ProviderModels | null>(null);
  const [provider, setProvider] = useState<Provider>('none');
  const [model, setModel] = useState<string>('');

  // Restore persisted selection
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { provider: p, model: m } = JSON.parse(raw);
        if (p) setProvider(p);
        if (m) setModel(m);
      }
    } catch {}
  }, []);

  // Fetch models from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await aiService.models();
        if (!res?.success) throw new Error(res?.message || 'Failed to load models');
        const data = res.data as ProviderModels;
        if (mounted) {
          setModelsInfo(data);
          // Initialize provider/model if not set
          setProvider(prev => (prev === 'none' ? data.defaults.provider : prev));
          setModel(prev => (prev ? prev : data.defaults.model));
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load models');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persist selection
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, model }));
    } catch {}
  }, [provider, model]);

  const providerOptions = useMemo(() => [
    { id: 'ollama', label: 'Ollama (local)' },
    { id: 'openai', label: 'OpenAI (cloud)' },
  ] as { id: Provider, label: string }[], []);

  const currentProviderAvailable = useMemo(() => {
    if (!modelsInfo) return false;
    if (provider === 'ollama') return modelsInfo.providers.ollama.available;
    if (provider === 'openai') return modelsInfo.providers.openai.available;
    return false;
  }, [modelsInfo, provider]);

  const availableModels = useMemo(() => {
    if (!modelsInfo) return [] as string[];
    if (provider === 'ollama') return modelsInfo.providers.ollama.models;
    if (provider === 'openai') return modelsInfo.providers.openai.models;
    return [];
  }, [modelsInfo, provider]);

  return (
    <div className="p-6">
      <motion.h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
        Settings
      </motion.h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-secondary-800 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-secondary-500">Current: {theme === 'dark' ? 'Dark' : 'Light'}</div>
            </div>
            <button className="btn-secondary" onClick={toggle}>Toggle Theme</button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-secondary-800">AI Provider</h2>
            {loading && <span className="badge badge-info">Loading models…</span>}
          </div>
          {error && <div className="alert alert-danger mb-4">{error}</div>}

          <div className="space-y-3">
            <label className="block text-sm font-medium">Provider</label>
            <select
              className="input"
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
            >
              {providerOptions.map(opt => (
                <option key={opt.id} value={opt.id} disabled={!modelsInfo ? true : !((opt.id === 'ollama' ? modelsInfo.providers.ollama.available : modelsInfo.providers.openai.available))}>
                  {opt.label} {modelsInfo && !((opt.id === 'ollama' ? modelsInfo.providers.ollama.available : modelsInfo.providers.openai.available)) ? '(unavailable)' : ''}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium">Model</label>
            <select
              className="input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!currentProviderAvailable}
            >
              {availableModels.length === 0 && (
                <option value="">{currentProviderAvailable ? 'No models found' : 'Provider unavailable'}</option>
              )}
              {availableModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <p className="text-xs text-secondary-500">If using Ollama, install and pull models locally. Default base URL is http://localhost:11434.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

