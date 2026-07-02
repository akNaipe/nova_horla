import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// TODO: Replace /favicon.ico with an actual favicon file (16x16 or 32x32 PNG/ICO)

export const metadata: Metadata = {
  title: "Nova Loja - Sua Loja Virtual",
  description: "Os melhores produtos com os melhores preços",
  openGraph: {
    title: "Nova Loja - Sua Loja Virtual",
    description: "Os melhores produtos com os melhores preços",
    locale: "pt_BR",
    type: "website",
    siteName: "Nova Loja",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Loja - Sua Loja Virtual",
    description: "Os melhores produtos com os melhores preços",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
