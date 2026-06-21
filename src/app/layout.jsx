// app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "مزرعة المنصوري - الأنشطة والحصاد",
  description:
    "شارك في حصاد التفاح والبطاطس واليوسفي والمزيد في مزرعتنا العضوية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#e8f5e9] min-h-screen flex flex-col`}
      >
        <LanguageProvider>
          <Header />
          <main className="grow mt-24">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
