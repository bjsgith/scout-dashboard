import type { Metadata } from "next";
import Link from "next/link";
import { Oswald, Hanken_Grotesk } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const display = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Scout — Field Log",
  description: "Local-only tracker for job applications and networking contacts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <div className="flex min-h-screen flex-col">
          <header className="topo border-b border-sage-dark bg-paper-raised/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4">
              <div className="flex h-16 items-center justify-between gap-4">
                <Link
                  href="/"
                  className="group flex items-center gap-2.5"
                  aria-label="Scout — go to dashboard"
                >
                  {/* Pathfinder mark: a compass needle pointing the way. */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 text-pine"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 5.5 14 12 12 18.5 10 12 Z"
                      className="fill-rust"
                    />
                    <circle cx="12" cy="12" r="1.1" className="fill-pine" />
                  </svg>
                  <span className="font-display text-2xl font-semibold uppercase tracking-[0.18em] text-pine">
                    Scout
                  </span>
                </Link>
                <SiteNav />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
            {children}
          </main>
          <footer className="border-t border-sage-dark bg-paper-raised">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-4 text-xs text-moss">
              <span className="blaze !h-2.5 !w-1.5" aria-hidden />
              <span className="font-display uppercase tracking-[0.14em]">
                Field log
              </span>
              <span aria-hidden>·</span>
              <span>Camped at 127.0.0.1</span>
              <span aria-hidden>·</span>
              <span>No auth, by design</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
