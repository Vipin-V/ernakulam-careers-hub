/** Normalise an Indian phone number to international digits (e.g. 919876543210). */
export function toIntlPhone(raw: string) {
  const d = raw.replace(/\D/g, "").replace(/^0+/, "");
  return d.length === 10 ? `91${d}` : d;
}

export function whatsappLink(phone: string, name: string, company: string, jobTitle: string) {
  const first = name.trim().split(/\s+/)[0] || "there";
  const text = `Hi ${first}, this is ${company} regarding your application for ${jobTitle} on KochiWorks. Are you available for a quick chat?`;
  return `https://wa.me/${toIntlPhone(phone)}?text=${encodeURIComponent(text)}`;
}
