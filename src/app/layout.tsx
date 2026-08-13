import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer, Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "American KAPI — auto import z USA | Copart i IAAI",
  description:
    "Wyszukiwarka aut z aukcji Copart i IAAI. Szacuj cło, akcyzę, VAT, transport i naprawy przy sprowadzeniu samochodu z USA do Polski.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
