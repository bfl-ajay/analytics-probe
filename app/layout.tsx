import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Report Builder - Create Reports with Drag & Drop",
  description:
    "Easy-to-use drag-and-drop analytical report builder. Connect to your MySQL database and create professional reports without coding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
