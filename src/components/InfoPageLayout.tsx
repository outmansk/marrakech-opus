import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd, type Crumb } from "@/lib/breadcrumbs";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";

/** Text page (about, legal notice, privacy): title, breadcrumb, sections. */
export default function InfoPageLayout({ title, h1, description, path, schema = [], noindex = false, children }: {
  title: string;
  h1: string;
  description: string;
  /** Path without language prefix, e.g. "/a-propos". */
  path: string;
  schema?: Record<string, unknown>[];
  noindex?: boolean;
  children: ReactNode;
}) {
  const { lp } = useLocalePath();
  const tL = useLocalizedText();
  const crumbs: Crumb[] = [{ name: tL("Accueil", "Home", "Inicio"), path: lp("/") }, { name: h1, path: lp(path) }];
  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#211f1b]">
      <SEOHead title={title} withBrand={false} description={description} schema={[breadcrumbJsonLd(crumbs), ...schema]} noindex={noindex} />
      <Header />
      <main className="mx-auto max-w-[820px] px-5 pb-20 pt-28 md:px-10">
        <Breadcrumbs crumbs={crumbs} className="mb-6" />
        <h1 className="mb-8 text-[38px] leading-[1.05] md:text-[52px]">{h1}</h1>
        <div className="flex flex-col gap-10 text-[15px] leading-[1.8] text-[#4f4a43] md:text-base [&_a]:underline [&_a]:decoration-[#a4573e]/50 [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-[28px] [&_h2]:leading-tight [&_h2]:text-[#211f1b] [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
