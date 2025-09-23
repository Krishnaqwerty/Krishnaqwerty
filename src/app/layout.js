import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AvatarApply } from "@/components/ui/avatar-apply";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Krishna Kumar",
  description: "Portfolio of Krishna Kumar - Software Developer and Tech Enthusiast",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AvatarApply>
          {children}
        </AvatarApply>
      </body>
    </html>
  );
}
