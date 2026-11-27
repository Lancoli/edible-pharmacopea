#!/usr/bin/env node
// Checks that a commit message follows the standard (docs/COMMITS.md). Called by the commit-msg hook of each repository.
//   node tools/commit-msg.mjs <message file>     exit code 1 if the message is rejected
//   node tools/commit-msg.mjs --texte "feat: …"          to try a message
//   node tools/commit-msg.mjs --preparer <file>     prepare-commit-msg hook: adds type emoji if missing
// Lets through messages produced by git itself (merge, automatic revert, fixup/squash).
import { readFileSync, writeFileSync } from 'node:fs';

export const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
// type emoji (gitmoji), placed at the beginning of the summary: "feat(carte): ✨ …" follows Conventional Commits
export const EMOJI = { feat: '✨', fix: '🐛', docs: '📝', style: '💄', refactor: '♻️', perf: '⚡', test: '✅', build: '📦', ci: '👷', chore: '🔧', revert: '⏪' };
const ENTETE = `^(${TYPES.join('|')})(\\([a-z0-9][a-z0-9-]*\\))?(!)?: (.+)$`;
const RE = new RegExp(ENTETE);
const RE_LIGNE = new RegExp(ENTETE, 'm');
const PICTO = /^\p{Extended_Pictographic}️?\s*/u;

export function verifier(message) {
  const lignes = message.split(/\r?\n/).filter((l) => !l.startsWith('#'));
  const t = lignes[0] || '';
  if (/^(Merge |Revert "|fixup! |squash! |amend! )/.test(t)) return [];
  const e = [];
  const m = t.match(RE);
  if (!m) e.push(`first line "${t.slice(0, 60)}" : expected "type(scope): summary", type among ${TYPES.join(', ')}`);
  else {
    const r = m[4].replace(PICTO, ''); // emoji doesn't count for case checking
    if (/^[A-ZÉÈÀ]/.test(r) && !/^[A-Z]{2,}/.test(r)) e.push('summary starts with lowercase (except acronym)');
    if (/[.!]$/.test(r)) e.push('no final period in summary');
    if (/^(wip|update|maj|divers|modifs?|changes?)$/i.test(r.trim())) e.push(`summary too vague: "${r}"`);
  }
  if (t.length > 72) e.push(`first line too long: ${t.length} characters (72 max)`);
  if (lignes.length > 1 && lignes[1].trim() !== '') e.push('blank line between summary and body');
  if (/^Ticket #\d+ :/.test(t)) e.push('old format: put "Ticket: #id" in message footer');
  // no tool signature: the commit author is the person who makes it
  if (lignes.some((l) => /co-authored-by:.*(claude|anthropic)|generated with \[?claude|🤖/i.test(l)))
    e.push('tool signature forbidden (Co-Authored-By Claude, "Generated with Claude Code"): remove the line');
  return e;
}

// adds type emoji to the summary of a conforming message that doesn't have one; leaves everything else alone
export function preparer(t) {
  return t.replace(RE_LIGNE, (l, ty, po, br, r) => (PICTO.test(r) ? l : `${ty}${po || ''}${br || ''}: ${EMOJI[ty]} ${r}`));
}

const args = process.argv.slice(2);
if (args[0] === '--preparer') {
  const t = readFileSync(args[1], 'utf8');
  const u = preparer(t);
  if (u !== t) writeFileSync(args[1], u);
} else if (args.length) {
  const msg = args[0] === '--texte' ? args.slice(1).join(' ') : readFileSync(args[0], 'utf8');
  const e = verifier(msg);
  if (e.length) {
    console.error('✗ commit message rejected (standard: docs/COMMITS.md at portfolio root)');
    for (const x of e) console.error('  · ' + x);
    console.error('  example: feat(carte): ✨ ajouter l\'itinéraire en transports');
    process.exit(1);
  }
}
