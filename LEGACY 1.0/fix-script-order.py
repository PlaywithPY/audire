#!/usr/bin/env python3
"""
Mise à jour de l'ordre des scripts dans toutes les pages HTML
"""

import re
from pathlib import Path

def fix_script_order(filepath):
    """Fixe l'ordre des scripts dans un fichier HTML"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Chercher les scripts actuels (peut être dans n'importe quel ordre)
    # Pattern pour trouver la section des scripts
    pattern = r'(<script src="(?:\.\.\/)?js\/(?:content-loader|components|main)\.js"(?:\s+defer)?></script>\s*){1,3}'

    # Le bon ordre des scripts
    # Déterminer si on est à la racine ou dans un sous-dossier
    if '/audire/' in str(filepath) and str(filepath).count('/') > str(Path('/home/user/audire/')).count('/'):
        # Sous-dossier
        correct_order = '''<script src="../js/components.js"></script>
  <script src="../js/content-loader.js"></script>
  <script src="../js/main.js" defer></script>'''
    else:
        # Racine
        correct_order = '''<script src="js/components.js"></script>
  <script src="js/content-loader.js"></script>
  <script src="js/main.js" defer></script>'''

    # Remplacer
    new_content = re.sub(pattern, correct_order + '\n', content, flags=re.MULTILINE)

    # Sauvegarder si changement
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    base_dir = Path('/home/user/audire')
    html_files = list(base_dir.rglob('*/index.html'))

    # Ajouter index.html à la racine
    root_index = base_dir / 'index.html'
    if root_index.exists() and root_index not in html_files:
        html_files.append(root_index)

    # Filtrer .git
    html_files = [f for f in html_files if '.git' not in str(f)]

    print(f"🔄 Mise à jour de l'ordre des scripts dans {len(html_files)} fichiers...")

    updated = 0
    for filepath in sorted(html_files):
        try:
            if fix_script_order(filepath):
                print(f"  ✅ {filepath.relative_to(base_dir)}")
                updated += 1
            else:
                print(f"  ⏭️  {filepath.relative_to(base_dir)} (déjà à jour)")
        except Exception as e:
            print(f"  ❌ {filepath.relative_to(base_dir)}: {e}")

    print(f"\n✨ {updated} fichiers mis à jour")

if __name__ == '__main__':
    main()
