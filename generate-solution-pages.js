#!/usr/bin/env node
/**
 * Générateur de pages HTML pour les solutions auditives
 * Usage: node generate-solution-pages.js
 */

const fs = require('fs');
const path = require('path');

// Charger le JSON des solutions
const solutionsPath = path.join(__dirname, 'content', 'solutions-auditives.json');
const solutionsData = JSON.parse(fs.readFileSync(solutionsPath, 'utf8'));

// Template HTML pour une page de solution
function generateHTML(solution) {
  const badgeHTML = solution.badge
    ? `<span class="badge">⭐ ${solution.badge}</span>`
    : '';

  const avantagesHTML = solution.avantages
    .map(av => `              <li>${av}</li>`)
    .join('\n');

  const inconvenientsHTML = solution.inconvenients
    .map(inc => `              <li>${inc}</li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO -->
  <title>${solution.titre} - Appareil auditif | Audire</title>
  <meta name="description" content="${solution.description_courte}">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/audire/css/styles.css">
  <style>
    .detail-hero {
      padding: 60px 0;
      background: var(--bg);
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      margin-bottom: 40px;
    }
    .detail-content h1 {
      font-size: 36px;
      margin-bottom: 12px;
      color: var(--text);
    }
    .detail-content .badge {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .detail-content p {
      font-size: 16px;
      line-height: 1.8;
      color: var(--text-light);
      margin-bottom: 16px;
    }
    .detail-image {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: var(--radius-lg);
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .detail-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 16px;
    }

    .pros-cons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 60px;
    }
    .pros-cons-box {
      background: var(--panel);
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      padding: 28px;
    }
    .pros-cons-box h3 {
      font-size: 20px;
      margin-bottom: 16px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pros-cons-box ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .pros-cons-box li {
      padding: 8px 0;
      display: flex;
      align-items: start;
      gap: 12px;
      color: var(--text-light);
      line-height: 1.6;
    }
    .pros-cons-box.pros {
      border-color: #4CAF50;
    }
    .pros-cons-box.pros h3 {
      color: #4CAF50;
    }
    .pros-cons-box.pros li::before {
      content: '✓';
      color: #4CAF50;
      font-weight: 700;
      font-size: 18px;
    }
    .pros-cons-box.cons {
      border-color: #FF6B6B;
    }
    .pros-cons-box.cons h3 {
      color: #FF6B6B;
    }
    .pros-cons-box.cons li::before {
      content: '✗';
      color: #FF6B6B;
      font-weight: 700;
      font-size: 18px;
    }

    .info-section {
      padding: 60px 0;
      background: var(--bg-alt);
    }
    .info-block {
      max-width: 900px;
      margin: 0 auto;
    }
    .info-block h2 {
      font-size: 28px;
      margin-bottom: 16px;
      color: var(--text);
    }
    .info-block p {
      font-size: 16px;
      line-height: 1.8;
      color: var(--text-light);
      margin-bottom: 16px;
    }

    .metadata {
      display: flex;
      gap: 24px;
      margin: 24px 0;
      flex-wrap: wrap;
    }
    .metadata-item {
      background: var(--secondary);
      padding: 12px 20px;
      border-radius: var(--radius-sm);
      font-size: 14px;
    }
    .metadata-item strong {
      color: var(--primary);
      display: block;
      margin-bottom: 4px;
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .pros-cons {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div id="app-header"></div>

  <!-- Main Content -->
  <main>

    <!-- Hero Section -->
    <section class="detail-hero">
      <div class="container">
        <div class="detail-grid">
          <!-- Content -->
          <div class="detail-content animate-on-scroll">
            ${badgeHTML}
            <h1>${solution.titre}</h1>
            <p>${solution.description_courte}</p>
            <p>${solution.description_longue}</p>

            <div class="metadata">
              <div class="metadata-item">
                <strong>Type</strong>
                ${solution.type}
              </div>
              <div class="metadata-item">
                <strong>Marques</strong>
                ${solution.marques.join(', ')}
              </div>
              <div class="metadata-item">
                <strong>Niveaux de perte</strong>
                ${solution.niveaux_perte.join(', ')}
              </div>
            </div>
          </div>
          <!-- Image -->
          <div class="detail-image animate-on-scroll">
            <img src="${solution.image}" alt="${solution.titre}" onerror="this.style.display='none'">
          </div>
        </div>

        <!-- Pros & Cons -->
        <div class="pros-cons">
          <div class="pros-cons-box pros animate-on-scroll">
            <h3>✓ Points forts</h3>
            <ul>
${avantagesHTML}
            </ul>
          </div>
          <div class="pros-cons-box cons animate-on-scroll">
            <h3>✗ Points faibles</h3>
            <ul>
${inconvenientsHTML}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Info Section -->
    <section class="info-section">
      <div class="container">
        <div class="info-block animate-on-scroll" style="text-align: center;">
          <h2>Découvrez ${solution.titre} chez Audire</h2>
          <p style="margin-bottom: 28px;">
            Venez tester cette solution lors d'une démonstration personnalisée.
          </p>
          <button class="btn btn-primary btn-lg" data-open-modal>
            <span>📅</span>
            <span>Réserver un rendez-vous</span>
          </button>
          <p style="margin-top: 20px; font-size: 14px; color: var(--text-muted);">
            Test gratuit • Sans engagement • Conseils personnalisés
          </p>
        </div>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <div id="app-footer"></div>

  <!-- Modal -->
  <div id="app-modal"></div>

  <!-- Scripts -->
  <script src="/audire/js/config.js"></script>
  <script src="/audire/js/design-loader.js"></script>
  <script src="/audire/js/content-loader.js"></script>
  <script src="/audire/js/components.js"></script>
  <script src="/audire/js/main.js"></script>
</body>
</html>
`;
}

// Générer les pages pour chaque solution
console.log('🚀 Génération des pages de solutions auditives...\n');

solutionsData.solutions.forEach(solution => {
  const dirPath = path.join(__dirname, 'solutions-auditives', solution.id);
  const filePath = path.join(dirPath, 'index.html');

  // Créer le dossier si nécessaire
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Créé: ${dirPath}`);
  }

  // Générer et écrire le fichier HTML
  const html = generateHTML(solution);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Généré: ${filePath}`);
});

console.log('\n✨ Génération terminée !');
console.log(`📊 ${solutionsData.solutions.length} page(s) générée(s)`);
