#!/usr/bin/env node
// =====================================================
// Sprint 5.8 — Patch automatique du schéma Prisma
// =====================================================
// Ajoute deux champs nullables sur HearingAid (sectionKickers + heroBadges)
// puis applique la migration sur la base et régénère le client Prisma.
//
// Usage (depuis la racine du repo) :
//   node prisma/patch-sprint5-8.mjs
//
// Le script est idempotent : tu peux le relancer sans risque, il détecte
// les marqueurs et ne touche à rien si c'est déjà patché.

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const SCHEMA_PATH = path.join(process.cwd(), 'prisma', 'schema.prisma');
const MARKER_BEGIN = '// === Sprint 5.8 BEGIN ===';
const MARKER_END   = '// === Sprint 5.8 END ===';

const PATCH_LINES = [
  '',
  '  ' + MARKER_BEGIN,
  '  /// JSON : { promises, section1, section2, highlight1, section3, section4, highlight2, accessories }',
  '  sectionKickers String?',
  '  /// JSON : [{ text: string, dotColor: string }]',
  '  heroBadges     String?',
  '  ' + MARKER_END,
  '',
].join('\n');

function log(msg, color = '') {
  const codes = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', dim: '\x1b[2m', reset: '\x1b[0m' };
  console.log((codes[color] || '') + msg + codes.reset);
}

// 1. Lire le schéma
if (!fs.existsSync(SCHEMA_PATH)) {
  log(`❌ ${SCHEMA_PATH} introuvable. Lance ce script depuis la racine du repo.`, 'red');
  process.exit(1);
}
const original = fs.readFileSync(SCHEMA_PATH, 'utf8');

// 2. Idempotence : si déjà patché, on saute l'édition.
if (original.includes(MARKER_BEGIN)) {
  log('✓ schema.prisma : déjà patché (Sprint 5.8 markers détectés).', 'dim');
} else {
  // 3. Localiser model HearingAid { ... } et insérer juste avant la } finale du modèle.
  const re = /^(model HearingAid \{[\s\S]*?)^(\})/m;
  const m = original.match(re);
  if (!m) {
    log('❌ Impossible de trouver "model HearingAid { ... }" dans schema.prisma.', 'red');
    log('   Patche manuellement : voir prisma/PATCH.md.', 'red');
    process.exit(1);
  }

  // Sauvegarde de sécurité
  const backupPath = SCHEMA_PATH + '.backup-sprint5-8';
  fs.writeFileSync(backupPath, original, 'utf8');
  log(`📋 Backup : ${path.relative(process.cwd(), backupPath)}`, 'dim');

  const patched = original.replace(re, m[1].replace(/\s*$/, '') + PATCH_LINES + m[2]);
  fs.writeFileSync(SCHEMA_PATH, patched, 'utf8');
  log('✓ schema.prisma : sectionKickers + heroBadges ajoutés à HearingAid.', 'green');
}

// 4. Appliquer en base + régénérer le client.
log('\n→ npx prisma db push --accept-data-loss', 'dim');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
} catch (e) {
  log('\n❌ "prisma db push" a échoué. Vérifie ta DATABASE_URL.', 'red');
  process.exit(1);
}

log('\n→ npx prisma generate', 'dim');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  log('\n❌ "prisma generate" a échoué.', 'red');
  process.exit(1);
}

log('\n✅ Sprint 5.8 — migration appliquée.', 'green');
log('   Tu peux maintenant : git add prisma/ && commit && push.', 'dim');
