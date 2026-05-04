import {createRequire} from 'node:module';
import {fixupConfigRules} from '@eslint/compat';
import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import unicorn from 'eslint-plugin-unicorn';

const require = createRequire(import.meta.url);

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const configs = fixupConfigRules(
  compat.config(require('./.eslintrc.cjs')).map((config) => {
    if (config.plugins?.unicorn) {
      return {
        ...config,
        plugins: {
          ...config.plugins,
          unicorn,
        },
      };
    }
    return config;
  }),
);

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.idea/**', 'test-url.js'],
  },
  ...configs,
];
