import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '../../lib/autoScheduler';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ทีมผลไม้คุณภาพ",
  description: "เอไอ ผู้ช่วยส่วนตัว",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
