#!/usr/bin/env python3
"""
Script pour récupérer l'ID d'un calendrier Google
Utilise les credentials OAuth2 configurés
"""

import os
import sys
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Scopes requis pour lire les calendriers
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

def get_calendar_list():
    """Récupère et affiche la liste des calendriers"""

    # Récupérer les credentials depuis les variables d'environnement
    client_id = os.getenv('GOOGLE_CALENDAR_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CALENDAR_CLIENT_SECRET')
    refresh_token = os.getenv('GOOGLE_CALENDAR_REFRESH_TOKEN')

    if not client_id or not client_secret:
        print('❌ Erreur: Variables d\'environnement manquantes')
        print('   Assurez-vous que GOOGLE_CALENDAR_CLIENT_ID et')
        print('   GOOGLE_CALENDAR_CLIENT_SECRET sont définis')
        print('\nChargez votre .env.local:')
        print('   export $(cat .env.local | xargs)')
        sys.exit(1)

    creds = None

    # Si on a un refresh token, on l'utilise
    if refresh_token:
        print('✅ Utilisation du refresh token existant\n')
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=client_id,
            client_secret=client_secret,
            scopes=SCOPES
        )
    else:
        print('🔑 Pas de refresh token trouvé, authentification nécessaire\n')
        # Créer un fichier temporaire avec les credentials
        import json
        import tempfile

        credentials = {
            'installed': {
                'client_id': client_id,
                'client_secret': client_secret,
                'redirect_uris': ['urn:ietf:wg:oauth:2.0:oob'],
                'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token'
            }
        }

        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(credentials, f)
            credentials_file = f.name

        try:
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_file, SCOPES)
            creds = flow.run_console()
        finally:
            os.unlink(credentials_file)

    # Construire le service Calendar
    try:
        service = build('calendar', 'v3', credentials=creds)

        # Récupérer la liste des calendriers
        print('📅 Liste de vos calendriers:\n')
        print('=' * 80)

        calendar_list = service.calendarList().list().execute()
        calendars = calendar_list.get('items', [])

        if not calendars:
            print('❌ Aucun calendrier trouvé.')
            return

        for index, calendar in enumerate(calendars, 1):
            print(f'\n{index}. 📆 {calendar.get("summary")}')
            print(f'   ID: {calendar["id"]}')
            print(f'   Description: {calendar.get("description", "Aucune")}')
            print(f'   TimeZone: {calendar.get("timeZone")}')
            print(f'   Access: {calendar.get("accessRole")}')

            if calendar.get('primary'):
                print('   ⭐ CALENDRIER PRINCIPAL')

            print('   ' + '-' * 40)

        print('\n' + '=' * 80)
        print('\n💡 Utilisez l\'ID du calendrier souhaité comme GOOGLE_CALENDAR_ID')
        print('   Pour le calendrier principal, vous pouvez utiliser: "primary"')
        print('   Pour un calendrier spécifique, copiez son ID (ex: xxx@group.calendar.google.com)\n')

        # Afficher un exemple de configuration
        target_calendar = next(
            (cal for cal in calendars if cal.get('summary') == 'RDV Site'),
            calendars[0]
        )

        print(f'📝 Exemple de configuration pour {target_calendar.get("summary")}:\n')
        print(f'GOOGLE_CALENDAR_ID="{target_calendar["id"]}"')
        print()

    except Exception as error:
        print(f'❌ Erreur lors de la récupération des calendriers: {error}')
        sys.exit(1)

if __name__ == '__main__':
    get_calendar_list()
