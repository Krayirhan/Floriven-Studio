import process from 'node:process';

const rules = {
  RUNTIME_JOB_ID: (value) => typeof value === 'string' && value.trim().length >= 6,
  VITE_SUPABASE_URL: (value) => validUrl(value, { httpsOnly: true }),
  VITE_SUPABASE_ANON_KEY: (value) => typeof value === 'string' && value.trim().length >= 20,
  RUNTIME_INSPECTOR_GRANT: (value) => typeof value === 'string' && value.trim().length >= 32,
  RUNTIME_APP_URL: (value) => validUrl(value, { allowLocalHttp: true }),
};

const missing = [];
const invalid = [];
for (const [name, validate] of Object.entries(rules)) {
  const value = process.env[name];
  if (!value?.trim()) missing.push(name);
  else if (!validate(value)) invalid.push(name);
}
const ready = missing.length === 0 && invalid.length === 0;
console.log(JSON.stringify({ version: '1.0.0', ready, requiredCount: Object.keys(rules).length, presentCount: Object.keys(rules).length - missing.length, missing, invalid }, null, 2));
if (!ready) process.exitCode = 1;

function validUrl(value, options) {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash) return false;
    if (url.protocol === 'https:') return true;
    return options.allowLocalHttp === true && url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);
  } catch { return false; }
}
