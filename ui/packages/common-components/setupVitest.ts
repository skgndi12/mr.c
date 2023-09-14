// https://storybook.js.org/docs/react/writing-tests/stories-in-unit-tests#configure
// Storybook's preview file location
import * as globalStorybookConfig from './.storybook/preview';
import { Preview, setProjectAnnotations } from '@storybook/react';
import '@testing-library/jest-dom';

setProjectAnnotations(globalStorybookConfig as Preview);
