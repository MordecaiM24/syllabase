import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Image from "next/image";
import { ModeToggle } from "./components/ModeToggle";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NCSU Course Explorer",
  description: "A course explorer made by Mordecai Mengesteab. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-1100 bg-[url('/grid.svg')] antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full mb-96">
              <SidebarTrigger />
              {children}
              <footer className="flex flex-col flex-wrap items-start justify-center gap-2 text-sm pl-12">
                <p>Made by Mordecai Mengesteab</p>
                <a
                  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                  href="https://m16b.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    aria-hidden
                    src="https://nextjs.org/icons/window.svg"
                    alt="Window icon"
                    width={16}
                    height={16}
                  />
                  See more stuff!
                </a>
              </footer>
              <div className="fixed bottom-6 right-12">
                <ModeToggle />
              </div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
