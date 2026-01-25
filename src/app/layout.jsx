// app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageContext";
import { ClerkProvider } from "@clerk/nextjs";

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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#2d5a27",
        },
        elements: {
          formButtonPrimary: "bg-[#2d5a27] hover:bg-green-800",
          footerActionLink: "text-[#2d5a27] hover:text-green-800",
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="ar" dir="rtl" suppressHydrationWarning>
        <body
          className={`${inter.className} bg-[#e8f5e9] min-h-screen flex flex-col`}
        >
          <LanguageProvider>
            <Header />
            <main className="grow mt-24">{children}</main>{" "}
            {/* Añadí mt-24 para compensar el header fijo */}
            <Footer />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
