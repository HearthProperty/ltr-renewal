import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Renewal Uplift Planner | Hearth Property Management",
  description:
    "Should you renew this tenant or turn the unit? Get a free renewal plan with a raise recommendation, turn-vs-renew comparison, and exact next steps.",
  icons: {
    icon: "/hearth-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
