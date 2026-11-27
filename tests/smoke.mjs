#!/usr/bin/env node
/**
 * Smoke test for Archive Botanique
 * Verifies that the app structure is valid and main resources are present.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let failures = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    failures++;
  }
}

// Test 1: index.html exists and is valid HTML
test('index.html exists and contains valid HTML', () => {
  const indexPath = join(root, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error('index.html not found');
  }
  const html = readFileSync(indexPath, 'utf-8');
  if (!html.toLowerCase().includes('<!doctype html>')) {
    throw new Error('Missing DOCTYPE declaration');
  }
  if (!html.includes('<html')) {
    throw new Error('Missing <html> tag');
  }
  if (!html.includes('Archive Botanique')) {
    throw new Error('Missing app title');
  }
});

// Test 2: CSS file exists
test('Main CSS file exists', () => {
  const cssPath = join(root, 'css', 'archive.css');
  if (!existsSync(cssPath)) {
    throw new Error('css/archive.css not found');
  }
  const css = readFileSync(cssPath, 'utf-8');
  if (!css.includes(':root')) {
    throw new Error('CSS missing :root variables');
  }
  if (!css.includes('--hue')) {
    throw new Error('CSS missing --hue variable');
  }
});

// Test 3: JavaScript file exists
test('Main JavaScript file exists', () => {
  const jsPath = join(root, 'js', 'archive.js');
  if (!existsSync(jsPath)) {
    throw new Error('js/archive.js not found');
  }
  const js = readFileSync(jsPath, 'utf-8');
  if (js.length === 0) {
    throw new Error('JavaScript file is empty');
  }
});

// Test 4: Data files exist
test('Data files exist', () => {
  const specimensPath = join(root, 'js', 'specimens.js');
  if (!existsSync(specimensPath)) {
    throw new Error('js/specimens.js not found');
  }
  const drawingPath = join(root, 'js', 'drawing.js');
  if (!existsSync(drawingPath)) {
    throw new Error('js/drawing.js not found');
  }
});

// Test 5: Critical HTML structure
test('index.html contains critical structure', () => {
  const indexPath = join(root, 'index.html');
  const html = readFileSync(indexPath, 'utf-8');

  const required = [
    'class="bandeau"',
    'class="armoire"',
    'class="scene"',
    'archive.css',
    'archive.js',
    'specimens.js'
  ];

  for (const item of required) {
    if (!html.includes(item)) {
      throw new Error(`Missing critical element: ${item}`);
    }
  }
});

// Test 6: No hardcoded colors in CSS (theme compliance)
test('CSS has no hardcoded rgba() colors', () => {
  const cssPath = join(root, 'css', 'archive.css');
  const css = readFileSync(cssPath, 'utf-8');

  // Exclude SVG data URIs from the check
  const cssWithoutSvg = css.replace(/url\("data:image\/svg[^"]*"\)/g, '');

  const rgbaMatches = cssWithoutSvg.match(/rgba\([^)]+\)/g);
  if (rgbaMatches && rgbaMatches.length > 0) {
    throw new Error(`Found ${rgbaMatches.length} hardcoded rgba() values`);
  }
});

// Test 7: CSS has no hardcoded hex colors outside :root
test('CSS has no hardcoded hex colors outside :root', () => {
  const cssPath = join(root, 'css', 'archive.css');
  const css = readFileSync(cssPath, 'utf-8');

  // Extract :root section
  const rootMatch = css.match(/:root\s*\{[^}]*\}/s);
  if (!rootMatch) {
    throw new Error('No :root section found');
  }

  // Remove :root section and SVG data URIs
  const cssOutsideRoot = css
    .replace(/:root\s*\{[^}]*\}/s, '')
    .replace(/url\("data:image\/svg[^"]*"\)/g, '');

  // Check for hex colors (but allow black and white which are semantic)
  const hexMatches = cssOutsideRoot.match(/#[0-9a-fA-F]{3,6}\b/g);
  const nonSemanticHex = hexMatches?.filter(h =>
    h.toLowerCase() !== '#fff' &&
    h.toLowerCase() !== '#000' &&
    h.toLowerCase() !== '#ffffff' &&
    h.toLowerCase() !== '#000000'
  );

  if (nonSemanticHex && nonSemanticHex.length > 0) {
    throw new Error(`Found ${nonSemanticHex.length} hardcoded hex colors outside :root`);
  }
});

console.log('');
if (failures === 0) {
  console.log('✓ All smoke tests passed');
  process.exit(0);
} else {
  console.error(`✗ ${failures} test(s) failed`);
  process.exit(1);
}
