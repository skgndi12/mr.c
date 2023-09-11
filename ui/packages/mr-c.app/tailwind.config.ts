import type { Config } from 'tailwindcss';
import mrcTailwind from '@mrc/common-components/tailwind.config';

const config: Config = {
  presets: [mrcTailwind],
  // `mrcTailwind.content` includes a path to the components that are using tailwind in @mrc/common-components
  content: mrcTailwind.content.concat([
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ]),
};

export default config;
