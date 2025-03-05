import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlockchainX - Interactive Blockchain Simulator & Visualizer",
  description: "BlockchainX is an interactive blockchain simulator to visualize mining, create wallets, and send transactions in real-time. Learn blockchain and Bitcoin mining easily.",
  metadataBase: new URL('https://shahvandit8.github.io/blockchain-simulator/'),
  keywords: ["Blockchain Simulator", "Blockchain Visualizer", "Interactive Blockchain", "BlockchainX", "Learn Blockchain", "Block Mining Simulator", "Bitcoin Mining Simulator", "Crypto Mining Visualization", "Blockchain Development", "Cryptocurrency Transactions", "Blockchain Learning Tool", "Real-time Blockchain", "Next.js Blockchain App", "Blockchain Education", "Decentralized Ledger", "Blockchain Demo", "Cryptocurrency Wallet Simulation", "Digital Currency Transactions"],
  authors: [{ name: "Vandit Shah", url: "https://github.com/shahvandit8" }],
  category: "Blockchain Technology",
  openGraph: {
    title: "BlockchainX - Interactive Blockchain Simulator & Visualizer",
    description: "BlockchainX is an interactive blockchain simulator to visualize mining, create wallets, and send transactions in real-time. Learn blockchain and Bitcoin mining easily.",
    url: 'https://shahvandit8.github.io/blockchain-simulator/',
    siteName: "BlockchainX",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlockchainX - Interactive Blockchain Simulator & Visualizer",
    description: "BlockchainX is an interactive blockchain simulator to visualize mining, create wallets, and send transactions in real-time. Learn blockchain and Bitcoin mining easily.",
    images: ["https://i.ibb.co/sJ2WsJvz/og-5.png"],
  },
  alternates: {
    canonical: "https://shahvandit8.github.io/blockchain-simulator/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}