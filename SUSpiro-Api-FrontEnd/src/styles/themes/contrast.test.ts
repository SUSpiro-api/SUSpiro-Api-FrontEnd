import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../utils/contrast';
import clinica from './clinica.css?raw';

/** Lê os papéis de cor (--color-*) de um arquivo de tema. */
function readColors(css: string): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const match of css.matchAll(/--(color-[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    colors[match[1]] = match[2];
  }
  return colors;
}

/** [primeiro plano, fundo, mínimo]. 4,5 = texto normal; 3 = bordas e componentes de interface. */
const TEXT = 4.5;
const COMPONENT = 3;
const PAIRS: Array<[string, string, number]> = [
  ['color-text', 'color-surface', TEXT],
  ['color-text', 'color-bg-page', TEXT],
  ['color-text', 'color-surface-tint', TEXT],
  ['color-text-secondary', 'color-surface', TEXT],
  ['color-text-secondary', 'color-bg-page', TEXT],
  ['color-text-secondary', 'color-surface-subtle', TEXT],
  ['color-text-secondary', 'color-surface-tint', TEXT],
  ['color-text-muted', 'color-surface', TEXT],
  ['color-text-muted', 'color-surface-subtle', TEXT],
  ['color-link', 'color-surface', TEXT],
  ['color-link', 'color-surface-tint', TEXT],
  ['color-link', 'color-bg-page', TEXT],
  ['color-text-on-action', 'color-action', TEXT],
  ['color-text-on-action', 'color-action-hover', TEXT],
  ['color-text-on-action', 'color-action-active', TEXT],
  ['color-danger', 'color-surface', TEXT],
  ['color-danger', 'color-danger-surface', TEXT],
  ['color-danger', 'color-bg-page', TEXT],
  ['color-success', 'color-surface', TEXT],
  ['color-success', 'color-success-surface', TEXT],
  ['color-border-strong', 'color-surface', COMPONENT],
  ['color-border-strong', 'color-surface-subtle', COMPONENT],
  ['color-border-strong', 'color-bg-page', COMPONENT],
  ['color-focus', 'color-surface', COMPONENT],
  ['color-focus', 'color-bg-page', COMPONENT],
  ['color-action', 'color-surface', COMPONENT],
];

describe.each([['clinica', clinica]])('tema %s: contraste WCAG 2.2 AA', (_name, css) => {
  const colors = readColors(css);

  it.each(PAIRS)('%s sobre %s atinge o mínimo de %s:1', (foreground, background, minimum) => {
    expect(colors[foreground], `${foreground} não existe no tema`).toBeDefined();
    expect(colors[background], `${background} não existe no tema`).toBeDefined();

    const ratio = contrastRatio(colors[foreground], colors[background]);
    expect(ratio, `${foreground} sobre ${background} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimum);
  });
});
