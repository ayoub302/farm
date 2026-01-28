import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminButton from "@/components/AdminButton";
import { LanguageProvider } from "@/components/LanguageContext";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Ferme Al Manssouri - Activités et Récoltes",
  description:
    "Participez à nos récoltes de pommes, pommes de terre, mandarines et plus dans notre ferme biologique",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: { colorPrimary: "#2d5a27" },
        elements: {
          formButtonPrimary: "bg-[#2d5a27] hover:bg-green-800",
          footerActionLink: "text-[#2d5a27] hover:text-green-800",
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="fr" dir="ltr">
        <body
          className={`${inter.className} bg-[#e8f5e9] min-h-screen flex flex-col`}
        >
          <LanguageProvider>
            <Header />
            <AdminButton />
            <main className="grow mt-20">{children}</main>
            <Footer />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
