import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../utils/contrast';
import claro from './clinica.css?raw';
import escuro from './escuro.css?raw';
import suave from './suave.css?raw';

function readColors(css: string): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const match of css.matchAll(/--(color-[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    colors[match[1]] = match[2];
  }
  return colors;
}

const baseColors = readColors(claro);
const themeColors = [
  ['claro', baseColors],
  ['escuro', readColors(escuro)],
  ['suave', { ...baseColors, ...readColors(suave) }],
] as const;

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
  ['color-warning', 'color-surface', TEXT],
  ['color-warning', 'color-surface-subtle', TEXT],
  ['color-warning', 'color-warning-surface', TEXT],
  ['color-warning', 'color-bg-page', TEXT],
  ['color-border-strong', 'color-surface', COMPONENT],
  ['color-border-strong', 'color-surface-subtle', COMPONENT],
  ['color-border-strong', 'color-bg-page', COMPONENT],
  ['color-focus', 'color-surface', COMPONENT],
  ['color-focus', 'color-bg-page', COMPONENT],
  ['color-action', 'color-surface', COMPONENT],
];

describe.each(themeColors)('tema %s: contraste WCAG 2.2 AA', (_name, colors) => {
  it.each(PAIRS)('%s sobre %s atinge o mínimo de %s:1', (foreground, background, minimum) => {
    expect(colors[foreground], `${foreground} não existe no tema`).toBeDefined();
    expect(colors[background], `${background} não existe no tema`).toBeDefined();

    const ratio = contrastRatio(colors[foreground], colors[background]);
    expect(ratio, `${foreground} sobre ${background} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimum);
  });
});


describe('tema suave', () => {
  it('altera somente o fundo da página e preserva a identidade azul', () => {
    const softOverrides = readColors(suave);
    expect(Object.keys(softOverrides)).toEqual(['color-bg-page']);
    expect({ ...baseColors, ...softOverrides }['color-action']).toBe('#0b5aa8');
  });
});
