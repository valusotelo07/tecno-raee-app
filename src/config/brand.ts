import config from './brand.json';

// El sufijo sólo controla la presentación; el nombre siempre viene de config.name.
const suffix = config.accentSuffix;
const hasAccent = suffix.length > 0 && config.name.endsWith(suffix);
const prefix = hasAccent ? config.name.slice(0, -suffix.length) : config.name;
const wordmarkSuffix = hasAccent ? suffix : '';

export const brand = {
  name: config.name,
  wordmarkPrefix: prefix,
  wordmarkSuffix,
  authName: [prefix, wordmarkSuffix].filter(Boolean).join(' ').toUpperCase(),
};
