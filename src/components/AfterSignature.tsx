import type { LucideIcon } from "lucide-react";
import { Globe2, Handshake, MessageCircle, Plug, Sparkles, Wrench } from "lucide-react";
import { useLocalePath } from "@/hooks/useLocalePath";
import { AFTERCARE, type AftercareServiceId } from "@/content/aftercare";
import { AGENCY } from "@/content/agency";

const ICONS: Record<AftercareServiceId, LucideIcon> = {
  travaux: Wrench,
  entretien: Sparkles,
  mediation: Handshake,
  installation: Plug,
  distance: Globe2,
};

/** Home page section: the agency stays the client's contact after the signature (texts in content/aftercare.ts). */
export default function AfterSignature() {
  const { lang } = useLocalePath();
  const copy = AFTERCARE[lang];
  const whatsapp = `https://wa.me/${AGENCY.phone.replace("+", "")}?text=${encodeURIComponent(copy.whatsapp)}`;

  return (
    <section id="apres-la-signature" className="bg-[#fbf8f2] px-5 py-12 lg:px-0 lg:py-[120px]">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-8 lg:gap-16 lg:px-16">
        <div className="flex max-w-[820px] flex-col gap-3.5 lg:gap-[22px]">
          <p className="text-[11px] font-medium uppercase leading-none tracking-[0.24em] text-[#a4573e] lg:text-xs lg:tracking-[0.26em]">{copy.eyebrow}</p>
          <h2 className="text-[36px] font-normal leading-[1.02] tracking-[-0.02em] lg:text-[64px] lg:leading-none">{copy.title}</h2>
          <p className="max-w-[640px] text-[15px] leading-[1.75] text-[#655f56] lg:text-base lg:leading-[1.8]">{copy.intro}</p>
        </div>

        <ol className="grid border-t border-[#211f1b]/[0.18] lg:grid-cols-3">
          {copy.moments.map(({ label, text }, index) => (
            <li key={label} className={`grid grid-cols-[34px_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 border-b border-[#211f1b]/[0.18] py-4 lg:flex lg:flex-col lg:gap-2.5 lg:border-b-0 lg:py-9 lg:pr-10 ${index > 0 ? "lg:border-l lg:pl-10" : ""}`}>
              <span className="row-span-2 font-serif text-[20px] italic leading-none text-[#a4573e] lg:text-[26px]">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-serif text-[24px] leading-none lg:text-[36px]">{label}</span>
              <span className="text-sm leading-[1.6] text-[#655f56] lg:text-[15px] lg:leading-[1.7]">{text}</span>
            </li>
          ))}
        </ol>

        <div className="grid gap-8 lg:grid-cols-[7fr_5fr] lg:gap-20">
          <div className="flex flex-col gap-5">
            <h3 className="font-serif text-[26px] leading-tight lg:text-[34px]">{copy.servicesTitle}</h3>
            <ul className="grid gap-3.5 sm:grid-cols-2 lg:gap-5">
              {copy.services.map(({ id, title, text }) => {
                const Icon = ICONS[id];
                return (
                  <li key={id} className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#a4573e]/40 text-[#a4573e] lg:h-10 lg:w-10">
                      <Icon size={18} strokeWidth={1.4} aria-hidden="true" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-medium text-[#211f1b]">{title}</span>
                      <span className="text-[13px] leading-[1.55] text-[#655f56] lg:text-sm lg:leading-[1.6]">{text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-5 lg:gap-6">
            <figure className="flex flex-col gap-3 border-l-2 border-[#a4573e] bg-[#ede5d8] px-5 py-5 lg:px-8 lg:py-8">
              <figcaption className="text-[11px] font-medium uppercase leading-none tracking-[0.2em] text-[#a4573e]">{copy.storyLabel}</figcaption>
              <blockquote className="font-serif text-[19px] italic leading-[1.4] text-[#211f1b] lg:text-2xl">{copy.story}</blockquote>
            </figure>
            <p className="text-sm leading-[1.7] text-[#655f56]">{copy.pricing}</p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center justify-between gap-3.5 bg-[#211f1b] px-5 text-xs font-medium uppercase leading-none tracking-[0.16em] text-[#fbf8f2] transition-colors duration-200 hover:bg-[#a4573e] hover:text-[#fbf8f2] lg:self-start lg:px-[26px] lg:tracking-[0.18em]"
            >
              {copy.cta}
              <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
