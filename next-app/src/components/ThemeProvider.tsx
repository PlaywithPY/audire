import { prisma } from '@/lib/prisma';

export async function ThemeProvider() {
  // Récupérer les couleurs depuis la DB
  const colors = await prisma.themeColors.findFirst({
    where: { id: 1 },
  });

  const primary = colors?.primary || '#42a4ff';
  const primaryLight = colors?.primaryLight || '#5ab3ff';
  const primaryDark = colors?.primaryDark || '#2d87e6';
  const secondary = colors?.secondary || '#EBF5FF';

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            --color-primary: ${primary};
            --color-primary-light: ${primaryLight};
            --color-primary-dark: ${primaryDark};
            --color-secondary: ${secondary};
          }
        `,
      }}
    />
  );
}
