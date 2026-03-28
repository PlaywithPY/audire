// Script pour obtenir le Refresh Token Google Calendar
// Suivez ces étapes :
// 1. Ouvrez votre fichier credentials.json téléchargé depuis Google Cloud Console
// 2. Copiez le client_id et client_secret ci-dessous
// 3. Exécutez : node get-refresh-token.js
// 4. Suivez les instructions dans le terminal

const { google } = require('googleapis');
const readline = require('readline');

// ⚠️ REMPLACEZ CES VALEURS PAR CELLES DE VOTRE FICHIER credentials.json
const CLIENT_ID = 'VOTRE_CLIENT_ID_ICI';
const CLIENT_SECRET = 'VOTRE_CLIENT_SECRET_ICI';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

// Ne modifiez pas le code ci-dessous
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Force l'affichage de l'écran de consentement pour obtenir le refresh_token
});

console.log('\n✅ Script prêt à obtenir votre Refresh Token !\n');
console.log('📋 ÉTAPES À SUIVRE :');
console.log('1. Cliquez ou copiez ce lien dans votre navigateur :');
console.log('\n🔗', authUrl, '\n');
console.log('2. Connectez-vous avec votre compte Google (centre.audire@gmail.com)');
console.log('3. Autorisez l\'application à accéder à Google Calendar');
console.log('4. Copiez le code d\'autorisation affiché');
console.log('5. Collez-le ci-dessous\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('📝 Entrez le code d\'autorisation ici : ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération du token :', err);
      console.log('\n💡 Vérifiez que :');
      console.log('  - Le CLIENT_ID et CLIENT_SECRET sont corrects');
      console.log('  - Vous avez copié le code complet sans espaces');
      console.log('  - L\'API Google Calendar est activée dans Google Cloud Console');
      return;
    }

    console.log('\n🎉 Succès ! Voici votre Refresh Token :');
    console.log('\n🔑 REFRESH_TOKEN =', token.refresh_token);
    console.log('\n📋 Copiez ce token et ajoutez-le dans votre fichier .env :');
    console.log('GOOGLE_CALENDAR_REFRESH_TOKEN="' + token.refresh_token + '"');
    console.log('\n✅ Vous pouvez maintenant supprimer ce fichier get-refresh-token.js\n');
  });
});
