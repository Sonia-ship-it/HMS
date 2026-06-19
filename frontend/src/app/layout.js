import { Lexend } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "SmartHMS — Hospital Appointment & Queue",
  description: "Smart Hospital Appointment & Queue Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className={lexend.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
