import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SiteInformativoBanner } from "./SiteInformativoBanner";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SiteInformativoBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
