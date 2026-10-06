/**
 * Numéro au format international, chiffres seulement (« 06 12 34 56 78 » → « 212612345678 »).
 * Les numéros marocains saisis en local (0X XX XX XX XX) reçoivent l'indicatif 212.
 */
export function phoneDigits(phone: string | null | undefined) {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("0")) digits = `212${digits.slice(1)}`;
  return digits;
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
