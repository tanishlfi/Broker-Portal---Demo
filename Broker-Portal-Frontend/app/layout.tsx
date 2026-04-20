import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/context/UserContext";

export const metadata: Metadata = {
  title: "RMA Broker Portal",
  description: "RMA Broker Portal — Caring | Compassionate | Compensation",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
