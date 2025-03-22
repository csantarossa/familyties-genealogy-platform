import localFont from "next/font/local";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./contexts/UserContext";
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "FamilyTies",
  description: "A modern family-tree tracker!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.className} antialiased`}>
        <UserProvider>
          <Toaster position="bottom-right" />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
