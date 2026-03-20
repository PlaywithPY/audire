import { prisma } from '@/lib/prisma';

export async function ThemeProvider() {
  // Default colors (fallback)
  const defaultColors = {
    primary: '#42a4ff',
    primaryLight: '#5ab3ff',
    primaryDark: '#2d87e6',
    secondary: '#EBF5FF',
  };

  let colors = defaultColors;

  try {
    // Try to fetch colors from database
    const dbColors = await prisma.themeColors.findFirst({
      where: { id: 1 },
    });

    if (dbColors) {
      colors = {
        primary: dbColors.primary,
        primaryLight: dbColors.primaryLight,
        primaryDark: dbColors.primaryDark,
        secondary: dbColors.secondary,
      };
    }
  } catch (error) {
    // Database not available (e.g., during build time)
    // Use default colors silently
    console.warn('ThemeProvider: Database not available, using default colors');
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            --color-primary: ${colors.primary};
            --color-primary-light: ${colors.primaryLight};
            --color-primary-dark: ${colors.primaryDark};
            --color-secondary: ${colors.secondary};
          }
        `,
      }}
    />
  );
}
