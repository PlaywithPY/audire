#!/usr/bin/env python3
"""
Script pour extraire automatiquement tous les textes des pages Next.js
et générer les pageDefinitions pour text-editor
"""

import re
import os
from pathlib import Path

# Pages à analyser
PAGES = {
    'home': 'src/app/page.tsx',
    'test-auditif-gratuit': 'src/app/test-auditif-gratuit/page.tsx',
    'notre-accompagnement': 'src/app/notre-accompagnement/page.tsx',
    'solutions-auditives': 'src/app/solutions-auditives/page.tsx',
    'remboursements': 'src/app/remboursements/page.tsx',
    'faq': 'src/app/faq/page.tsx',
    'contact': 'src/app/contact/page.tsx',
    'partenaires-pharmaciens': 'src/app/partenaires-pharmaciens/page.tsx',
}

ICONS = {
    'home': '🏠',
    'test-auditif-gratuit': '👂',
    'notre-accompagnement': '🤝',
    'solutions-auditives': '🎧',
    'remboursements': '💰',
    'faq': '❓',
    'contact': '📍',
    'partenaires-pharmaciens': '💊',
}

def extract_texts_from_page(filepath):
    """Extrait les textes d'une page TSX"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    texts = []

    # Extraire les h1
    h1_matches = re.findall(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    for match in h1_matches:
        clean_text = re.sub(r'<[^>]+>', '', match).strip()
        if clean_text and len(clean_text) < 200:
            texts.append({
                'key': 'hero-title',
                'label': 'Titre principal (H1)',
                'content': clean_text,
                'type': 'text'
            })
            break  # Un seul H1 par page

    # Extraire les h2
    h2_matches = re.findall(r'<h2[^>]*>(.*?)</h2>', content, re.DOTALL)
    for i, match in enumerate(h2_matches):
        clean_text = re.sub(r'<[^>]+>', '', match).strip()
        if clean_text and len(clean_text) < 200:
            section = clean_text.lower().replace(' ', '-').replace('?', '').replace('!', '')[:30]
            texts.append({
                'key': f'section-{i+1}-title',
                'label': f'Titre section {i+1}',
                'content': clean_text,
                'type': 'text'
            })

    # Extraire les paragraphes importants (après h1 ou h2)
    p_matches = re.findall(r'<p[^>]*className="[^"]*text-xl[^"]*"[^>]*>(.*?)</p>', content, re.DOTALL)
    for i, match in enumerate(p_matches):
        clean_text = re.sub(r'<[^>]+>', '', match).strip()
        if clean_text and len(clean_text) > 20:
            texts.append({
                'key': f'description-{i+1}',
                'label': f'Description {i+1}',
                'content': clean_text[:500],  # Limiter la longueur
                'type': 'textarea',
                'rows': 3 if len(clean_text) < 150 else 5
            })

    # Extraire les kickers/badges
    kicker_matches = re.findall(r'<span[^>]*>([A-ZÀ-Ÿ][^<]{3,50})</span>', content)
    for match in kicker_matches:
        if '•' in match or match[0].isupper():
            texts.append({
                'key': 'hero-kicker',
                'label': 'Badge/Kicker',
                'content': match.strip(),
                'type': 'text'
            })
            break

    return texts

def generate_page_definitions():
    """Génère les pageDefinitions TypeScript"""
    base_path = Path('/home/user/audire/next-app')

    all_pages = []

    for page_key, page_path in PAGES.items():
        full_path = base_path / page_path
        if not full_path.exists():
            print(f"⚠️  Page non trouvée: {page_path}")
            continue

        print(f"📄 Analyse de {page_key}...")
        texts = extract_texts_from_page(full_path)

        # Construire le label
        page_label = page_key.replace('-', ' ').title()
        icon = ICONS.get(page_key, '📄')

        all_pages.append({
            'key': page_key,
            'label': f'{icon} {page_label}',
            'texts': texts
        })

    # Générer le TypeScript
    ts_output = "const pageDefinitions: PageDefinition[] = [\n"

    for page in all_pages:
        ts_output += f"  {{\n"
        ts_output += f"    pageKey: '{page['key']}',\n"
        ts_output += f"    pageLabel: '{page['label']}',\n"
        ts_output += f"    texts: [\n"

        for text in page['texts']:
            rows_str = f", rows: {text.get('rows', 3)}" if text['type'] == 'textarea' else ""
            ts_output += f"      {{ textKey: '{text['key']}', label: '{text['label']}', defaultContent: `{text['content']}`, type: '{text['type']}'{rows_str} }},\n"

        ts_output += f"    ]\n"
        ts_output += f"  }},\n"

    ts_output += "];\n"

    output_file = base_path / 'PAGE_DEFINITIONS.ts'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_output)

    print(f"\n✅ Généré: {output_file}")
    print(f"📊 {len(all_pages)} pages analysées")

    return all_pages

if __name__ == '__main__':
    pages = generate_page_definitions()

    # Afficher un résumé
    print("\n📋 Résumé:")
    for page in pages:
        print(f"  {page['label']}: {len(page['texts'])} textes")
