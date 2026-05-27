import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "HMS — Hospital Management System",
  description:
    "Secure hospital management dashboard to authenticate users, track admissions, and manage patient registries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lexend.variable}>
      <body>{children}</body>
    </html>
  );
}
