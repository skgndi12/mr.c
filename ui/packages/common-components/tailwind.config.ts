import plugin from 'tailwindcss/plugin';
import { join, resolve } from 'node:path';

export default {
  // `content` is replaced instead of extended, so this line has to be added in
  // the `content` of each app' tailwind.config
  content: [join(resolve(__dirname), './src/**/*.{js,ts,jsx,tsx}')],
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        '.headline-1-semibold': {
          '@apply text-xl font-semibold': {},
        },
      });
    }),
  ],
};
