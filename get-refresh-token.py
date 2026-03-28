#!/usr/bin/env python3
"""
Script pour obtenir le Refresh Token Google Calendar
Compatible Python 3.6+

Installation des dépendances :
pip install google-auth-oauthlib

Utilisation :
python get-refresh-token.py
"""

import json
import os
from google_auth_oauthlib.flow import InstalledAppFlow

# Scopes nécessaires pour Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

def main():
    print("\n" + "="*60)
    print("🔑 GÉNÉRATEUR DE REFRESH TOKEN GOOGLE CALENDAR")
    print("="*60 + "\n")

    # Demander le CLIENT_ID et CLIENT_SECRET
    print("📋 ÉTAPE 1 : Entrez vos credentials Google")
    print("-" * 60)
    print("Ouvrez votre fichier credentials.json téléchargé depuis")
    print("Google Cloud Console et copiez les valeurs ci-dessous.\n")

    client_id = input("➡️  CLIENT_ID : ").strip()
    if not client_id:
        print("❌ Erreur : CLIENT_ID est obligatoire")
        return

    client_secret = input("➡️  CLIENT_SECRET : ").strip()
    if not client_secret:
        print("❌ Erreur : CLIENT_SECRET est obligatoire")
        return

    # Créer un fichier temporaire de credentials
    credentials_info = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        }
    }

    temp_file = "temp_credentials.json"
    with open(temp_file, 'w') as f:
        json.dump(credentials_info, f)

    try:
        print("\n" + "="*60)
        print("📋 ÉTAPE 2 : Autorisation Google")
        print("="*60)
        print("\n🌐 Une fenêtre de navigateur va s'ouvrir automatiquement.")
        print("Si elle ne s'ouvre pas, copiez l'URL affichée.\n")
        print("⚠️  Google dira 'Cette application n'est pas vérifiée'")
        print("    C'est NORMAL ! Cliquez sur :")
        print("    1. 'Paramètres avancés'")
        print("    2. 'Accéder à [votre app] (non sécurisé)'\n")

        input("Appuyez sur Entrée pour continuer...")

        # Lancer le flow OAuth
        flow = InstalledAppFlow.from_client_secrets_file(
            temp_file,
            scopes=SCOPES,
            redirect_uri='urn:ietf:wg:oauth:2.0:oob'
        )

        # Générer l'URL d'autorisation
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            prompt='consent'
        )

        print("\n🔗 URL D'AUTORISATION :")
        print("-" * 60)
        print(auth_url)
        print("-" * 60 + "\n")

        print("📝 Connectez-vous avec votre compte Google (centre.audire@gmail.com)")
        print("📝 Autorisez l'accès à Google Calendar")
        print("📝 Copiez le CODE D'AUTORISATION affiché\n")

        # Demander le code d'autorisation
        code = input("➡️  Collez le code d'autorisation ici : ").strip()

        if not code:
            print("❌ Erreur : Code d'autorisation requis")
            return

        print("\n⏳ Récupération du refresh token...")

        # Échanger le code contre un token
        flow.fetch_token(code=code)
        credentials = flow.credentials

        if not credentials.refresh_token:
            print("\n❌ ERREUR : Pas de refresh token reçu")
            print("\n💡 Solution : Réessayez le script")
            print("   Google ne renvoie le refresh_token que la première fois.")
            print("   Si vous avez déjà autorisé cette app, révoquez l'accès ici :")
            print("   https://myaccount.google.com/permissions")
            return

        # Afficher le refresh token
        print("\n" + "="*60)
        print("🎉 SUCCÈS !")
        print("="*60)
        print("\n🔑 VOTRE REFRESH TOKEN :")
        print("-" * 60)
        print(credentials.refresh_token)
        print("-" * 60)

        print("\n📋 Copiez cette ligne dans votre fichier .env :")
        print("-" * 60)
        print(f'GOOGLE_CALENDAR_REFRESH_TOKEN="{credentials.refresh_token}"')
        print("-" * 60)

        print("\n📝 Votre fichier .env complet devrait ressembler à :")
        print("-" * 60)
        print(f'GOOGLE_CALENDAR_CLIENT_ID="{client_id}"')
        print(f'GOOGLE_CALENDAR_CLIENT_SECRET="{client_secret}"')
        print(f'GOOGLE_CALENDAR_REFRESH_TOKEN="{credentials.refresh_token}"')
        print('GOOGLE_CALENDAR_ID="RDV Site"')
        print("-" * 60)

        print("\n✅ C'est terminé ! Vous pouvez maintenant :")
        print("   - Copier le refresh token dans votre .env")
        print("   - Supprimer ce script Python")
        print("   - Supprimer le fichier credentials.json\n")

    except Exception as e:
        print(f"\n❌ ERREUR : {str(e)}")
        print("\n💡 Vérifiez que :")
        print("   - Le CLIENT_ID et CLIENT_SECRET sont corrects")
        print("   - Le code d'autorisation est complet (sans espaces)")
        print("   - L'API Google Calendar est activée")
        print("   - Vous avez installé : pip install google-auth-oauthlib")

    finally:
        # Supprimer le fichier temporaire
        if os.path.exists(temp_file):
            os.remove(temp_file)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Annulé par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur inattendue : {str(e)}")
