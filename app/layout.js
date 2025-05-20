import localFont from "next/font/local";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { UserProvider } from "./contexts/UserContext";
import SafeToaster from "@/app/lib/toast";
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "FamilyTies",
  description: "A modern family-tree tracker!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${plusJakarta.className} antialiased`}>
        <UserProvider>
          <SafeToaster />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

