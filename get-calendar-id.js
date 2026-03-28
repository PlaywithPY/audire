#!/usr/bin/env node
/**
 * Script pour récupérer l'ID d'un calendrier Google
 * Utilise les credentials OAuth2 configurés
 */

const { google } = require('googleapis');
const readline = require('readline');

// Configuration OAuth2
const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('   Assurez-vous que GOOGLE_CALENDAR_CLIENT_ID et');
  console.error('   GOOGLE_CALENDAR_CLIENT_SECRET sont définis');
  console.error('\nChargez votre .env.local:');
  console.error('   source .env.local (Linux/Mac)');
  console.error('   ou créez les variables temporairement');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

function getAccessToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🔐 Autorisez cette application en visitant cette URL:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('📋 Entrez le code de la page: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) return console.error('❌ Erreur lors de la récupération du token', err);
      oauth2Client.setCredentials(token);
      callback(oauth2Client);
    });
  });
}

async function listCalendars(auth) {
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    console.log('\n📅 Liste de vos calendriers:\n');
    console.log('=' .repeat(80));

    const res = await calendar.calendarList.list();
    const calendars = res.data.items;

    if (!calendars || calendars.length === 0) {
      console.log('❌ Aucun calendrier trouvé.');
      return;
    }

    calendars.forEach((cal, index) => {
      console.log(`\n${index + 1}. 📆 ${cal.summary}`);
      console.log(`   ID: ${cal.id}`);
      console.log(`   Description: ${cal.description || 'Aucune'}`);
      console.log(`   TimeZone: ${cal.timeZone}`);
      console.log(`   Access: ${cal.accessRole}`);

      if (cal.primary) {
        console.log('   ⭐ CALENDRIER PRINCIPAL');
      }

      console.log('   -'.repeat(40));
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Utilisez l\'ID du calendrier souhaité comme GOOGLE_CALENDAR_ID');
    console.log('   Pour le calendrier principal, vous pouvez utiliser: "primary"');
    console.log('   Pour un calendrier spécifique, copiez son ID (ex: xxx@group.calendar.google.com)\n');

    // Afficher un exemple de configuration
    const targetCalendar = calendars.find(cal => cal.summary === 'RDV Site') || calendars[0];
    console.log('📝 Exemple de configuration pour', targetCalendar.summary, ':\n');
    console.log('GOOGLE_CALENDAR_ID="' + targetCalendar.id + '"');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des calendriers:', error.message);
  }
}

// Si on a déjà un refresh token, on l'utilise
if (process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
  console.log('✅ Utilisation du refresh token existant\n');
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
  });
  listCalendars(oauth2Client);
} else {
  console.log('🔑 Pas de refresh token trouvé, authentification nécessaire\n');
  getAccessToken(oauth2Client, listCalendars);
}
