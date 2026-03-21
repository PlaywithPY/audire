import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const logs: string[] = [];
  const prisma = new PrismaClient();

  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    logs.push('🚀 Démarrage de la configuration de la base de données...\n');

    // Étape 1: Appliquer les migrations manuellement
    logs.push('📊 Étape 1/2: Application des migrations...');
    try {
      const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');

      // Lister tous les dossiers de migration
      const migrationFolders = fs.readdirSync(migrationsPath)
        .filter(file => {
          const fullPath = path.join(migrationsPath, file);
          return fs.statSync(fullPath).isDirectory();
        })
        .sort(); // Tri par ordre chronologique

      logs.push(`   Trouvé ${migrationFolders.length} migrations\n`);

      for (const folder of migrationFolders) {
        const sqlFile = path.join(migrationsPath, folder, 'migration.sql');

        if (fs.existsSync(sqlFile)) {
          logs.push(`   ➜ Application de ${folder}...`);
          const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

          // Séparer les commandes SQL (par point-virgule)
          const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

          // Exécuter chaque commande séparément
          for (const command of commands) {
            if (command) {
              await prisma.$executeRawUnsafe(command);
            }
          }

          logs.push(`   ✓ ${folder} appliquée (${commands.length} commandes)`);
        }
      }

      logs.push('✅ Toutes les migrations appliquées avec succès!\n');
    } catch (error: any) {
      logs.push(`❌ Erreur lors des migrations: ${error.message}`);

      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'application des migrations',
        logs,
      });
    }

    // Étape 2: Seed (code directement importé)
    logs.push('🌱 Étape 2/2: Peuplement de la base de données...');
    try {
      // Couleurs par défaut
      await prisma.themeColors.upsert({
        where: { id: 1 },
        update: {},
        create: {
          primary: '#42a4ff',
          primaryLight: '#5ab3ff',
          primaryDark: '#2d87e6',
          secondary: '#EBF5FF',
        },
      });
      logs.push('   ✓ Couleurs du thème créées');

      // Centres
      const centreJemeppe = await prisma.centre.upsert({
        where: { slug: 'jemeppe' },
        update: {},
        create: {
          name: 'Audire Jemeppe',
          slug: 'jemeppe',
          phoneFixe: '+32 4 234 56 78',
          phoneMobile: '+32 476 12 34 56',
          email: 'jemeppe@audire.be',
          address: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
          postalCode: '4101',
          city: 'Jemeppe-sur-Meuse',
          isActive: true,
          isDefault: true,
          latitude: 50.6197,
          longitude: 5.4981,
        },
      });
      logs.push('   ✓ Centre Jemeppe créé');

      const centreLiege = await prisma.centre.upsert({
        where: { slug: 'liege' },
        update: {},
        create: {
          name: 'Audire Liège Centre',
          slug: 'liege',
          phoneFixe: '+32 4 222 33 44',
          phoneMobile: '+32 477 55 66 77',
          email: 'liege@audire.be',
          address: 'Place du Marché, 15\n4000 Liège',
          postalCode: '4000',
          city: 'Liège',
          isActive: true,
          isDefault: false,
          latitude: 50.6412,
          longitude: 5.5719,
        },
      });
      logs.push('   ✓ Centre Liège créé');

      // Horaires Jemeppe
      const jemeppeHours = [
        { centreId: centreJemeppe.id, dayOfWeek: 0, isOpen: false },
        { centreId: centreJemeppe.id, dayOfWeek: 1, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
        { centreId: centreJemeppe.id, dayOfWeek: 2, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
        { centreId: centreJemeppe.id, dayOfWeek: 3, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
        { centreId: centreJemeppe.id, dayOfWeek: 4, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
        { centreId: centreJemeppe.id, dayOfWeek: 5, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
        { centreId: centreJemeppe.id, dayOfWeek: 6, isOpen: true, morningOpen: '09:00', morningClose: '12:30', afternoonOpen: null, afternoonClose: null },
      ];

      for (const hours of jemeppeHours) {
        await prisma.openingHours.upsert({
          where: { centreId_dayOfWeek: { centreId: hours.centreId, dayOfWeek: hours.dayOfWeek } },
          update: {},
          create: hours,
        });
      }
      logs.push('   ✓ Horaires Jemeppe créés');

      // Horaires Liège
      const liegeHours = [
        { centreId: centreLiege.id, dayOfWeek: 0, isOpen: false },
        { centreId: centreLiege.id, dayOfWeek: 1, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' },
        { centreId: centreLiege.id, dayOfWeek: 2, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' },
        { centreId: centreLiege.id, dayOfWeek: 3, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' },
        { centreId: centreLiege.id, dayOfWeek: 4, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' },
        { centreId: centreLiege.id, dayOfWeek: 5, isOpen: true, morningOpen: '08:30', morningClose: '12:00', afternoonOpen: '13:30', afternoonClose: '18:00' },
        { centreId: centreLiege.id, dayOfWeek: 6, isOpen: false },
      ];

      for (const hours of liegeHours) {
        await prisma.openingHours.upsert({
          where: { centreId_dayOfWeek: { centreId: hours.centreId, dayOfWeek: hours.dayOfWeek } },
          update: {},
          create: hours,
        });
      }
      logs.push('   ✓ Horaires Liège créés');

      // Témoignages
      await prisma.testimonial.upsert({
        where: { id: 1 },
        update: {},
        create: {
          name: 'Marie D.',
          text: 'Excellent accueil et professionnalisme. On prend vraiment le temps d\'expliquer et de répondre aux questions. Je recommande vivement !',
          rating: 5,
          location: 'Liège',
          isVisible: true,
          isFeatured: true,
        },
      });

      await prisma.testimonial.upsert({
        where: { id: 2 },
        update: {},
        create: {
          name: 'Jean-Pierre L.',
          text: 'Très satisfait de mon appareil auditif. Le suivi est impeccable, toujours disponible pour les réglages.',
          rating: 5,
          location: 'Seraing',
          isVisible: true,
          isFeatured: true,
        },
      });

      await prisma.testimonial.upsert({
        where: { id: 3 },
        update: {},
        create: {
          name: 'Sophie M.',
          text: 'Merci pour la patience et les explications claires. Enfin un centre qui écoute vraiment !',
          rating: 5,
          location: 'Herstal',
          isVisible: true,
          isFeatured: false,
        },
      });
      logs.push('   ✓ Témoignages créés');

      logs.push('✅ Seed exécuté avec succès!\n');
    } catch (error: any) {
      logs.push(`❌ Erreur lors du seed: ${error.message}`);

      return NextResponse.json({
        success: false,
        error: 'Erreur lors du peuplement de la base',
        logs,
      });
    }

    logs.push('🎉 Configuration terminée avec succès!');

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error('Erreur lors de la configuration de la DB:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur inconnue',
        logs: [`❌ Erreur: ${error.message}`]
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
