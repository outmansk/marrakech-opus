/** Garde uniquement les chiffres d'un numéro (« +212 6 12… » → « 2126 12… »). */
export function phoneDigits(phone: string | null | undefined) {
  return (phone ?? "").replace(/\D/g, "");
}

export function telHref(phone: string | null | undefined) {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits}` : undefined;
}

export function whatsappHref(phone: string | null | undefined, text?: string) {
  const digits = phoneDigits(phone);
  if (!digits) return undefined;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
