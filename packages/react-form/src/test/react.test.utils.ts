import { createElement, StrictMode, type PropsWithChildren } from 'react';

export const StrictModeWrapper = ({ children }: PropsWithChildren<Record<never, never>>) =>
  createElement(StrictMode, null, children);
