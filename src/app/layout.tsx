import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLIIX",
  description: "MVP foundation for the CLIIX link-in-bio platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
