import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔨 Création de la table ImageEffect dans SQLite...\n');

  try {
    // Exécuter le SQL directement pour créer la table (si elle n'existe pas)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ImageEffect" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "imageUrl" TEXT NOT NULL,
        "effectType" TEXT NOT NULL DEFAULT 'none',
        "effectSpeed" REAL NOT NULL DEFAULT 0.5,
        "effectScale" REAL NOT NULL DEFAULT 1.2,
        "pageKey" TEXT NOT NULL,
        "sectionKey" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isVisible" INTEGER NOT NULL DEFAULT 1,
        "alt" TEXT,
        "overlayColor" TEXT,
        "minHeight" TEXT NOT NULL DEFAULT '400px',
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Table ImageEffect créée (ou déjà existante)');

    // Créer l'index pour pageKey et order
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ImageEffect_pageKey_order_idx"
      ON "ImageEffect"("pageKey", "order")
    `);

    console.log('✅ Index créé');

    // Créer l'index unique pour pageKey + sectionKey
    // Note: SQLite ne supporte pas ALTER TABLE ADD CONSTRAINT pour UNIQUE
    // On doit créer un index unique à la place
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ImageEffect_pageKey_sectionKey_key"
      ON "ImageEffect"("pageKey", "sectionKey")
    `);

    console.log('✅ Index unique créé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }

  console.log('\n🎉 Table ImageEffect prête !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
