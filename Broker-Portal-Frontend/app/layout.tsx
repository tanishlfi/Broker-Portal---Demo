import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RMA Broker Portal",
  description: "RMA Broker Portal — Caring | Compassionate | Compensation",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
