import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Provider";
import Navbar from "@/components/navbar/navbar"; // client component
import Footer from "@/components/navbar/Footer";

export const metadata: Metadata = {
  title: "King Web Innovation",
  description: "Web solutions global",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
