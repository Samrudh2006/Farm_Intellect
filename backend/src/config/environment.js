const normalizeAppEnv = (value) => {
  const normalized = String(value || '').toLowerCase();

  if (['production', 'prod'].includes(normalized)) return 'production';
  if (['staging', 'stage'].includes(normalized)) return 'staging';
  if (normalized === 'test') return 'test';

  return 'local';
};

export const appEnv = normalizeAppEnv(process.env.APP_ENV || process.env.NODE_ENV);

const suffixByEnv = {
  local: 'LOCAL',
  staging: 'STAGING',
  production: 'PRODUCTION',
  test: 'TEST',
};

export const getScopedEnv = (baseName, { allowLegacyFallback = true } = {}) => {
  const suffix = suffixByEnv[appEnv] || 'LOCAL';
  const scopedKey = `${baseName}_${suffix}`;
  const scopedValue = process.env[scopedKey];

  if (scopedValue) {
    return scopedValue;
  }

  return allowLegacyFallback ? process.env[baseName] : undefined;
};
