import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CentreProvider } from "@/contexts/CentreContext";
import Providers from "@/components/Providers";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Audire — Centre auditif en province de Liège",
  description: "Centre auditif indépendant à Jemeppe-sur-Meuse. Test auditif gratuit, accompagnement humain, solutions Oticon & Bernafon.",
  keywords: "audioprothésiste, centre auditif, appareil auditif, test auditif gratuit, province de Liège",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png', sizes: '457x456' }
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-BE">
      <head>
        <ThemeProvider />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <Providers>
          <CentreProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </CentreProvider>
        </Providers>
      </body>
    </html>
  );
}
