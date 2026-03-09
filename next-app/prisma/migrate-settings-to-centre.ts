/**
 * Script de migration one-time pour transférer les données de SiteSettings vers Centre
 * À exécuter une seule fois après le déploiement
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migration des données de SiteSettings vers Centre...');

  try {
    // Récupérer tous les settings
    const settings = await prisma.siteSettings.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    console.log('📊 Settings trouvés:', Object.keys(settingsMap));

    // Trouver le centre par défaut
    const defaultCentre = await prisma.centre.findFirst({
      where: { isDefault: true },
    });

    if (!defaultCentre) {
      console.error('❌ Aucun centre par défaut trouvé!');
      return;
    }

    console.log('🏢 Centre par défaut:', defaultCentre.name);

    // Préparer les données à migrer
    const updateData: any = {};

    if (settingsMap.phone_fixe) {
      updateData.phoneFixe = settingsMap.phone_fixe;
      console.log('  ✓ phoneFixe:', settingsMap.phone_fixe);
    }

    if (settingsMap.phone_mobile) {
      updateData.phoneMobile = settingsMap.phone_mobile;
      console.log('  ✓ phoneMobile:', settingsMap.phone_mobile);
    }

    if (settingsMap.email) {
      updateData.email = settingsMap.email;
      console.log('  ✓ email:', settingsMap.email);
    }

    if (settingsMap.address) {
      updateData.address = settingsMap.address;
      console.log('  ✓ address:', settingsMap.address);
    }

    // Mettre à jour le centre si des données existent
    if (Object.keys(updateData).length > 0) {
      await prisma.centre.update({
        where: { id: defaultCentre.id },
        data: updateData,
      });

      console.log('✅ Centre mis à jour avec succès!');
      console.log('💡 Les anciennes données SiteSettings peuvent maintenant être supprimées.');
    } else {
      console.log('ℹ️  Aucune donnée à migrer.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
