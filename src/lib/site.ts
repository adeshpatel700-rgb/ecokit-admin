/** Central site configuration. Contact details are placeholders supplied in the original pages. */
export const SITE = {
  name: "EcoKit",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ecokit.in",
  description:
    "Premium eco-friendly hospitality amenities and personal care essentials for hotels, businesses and conscious homes.",
  email: "hello@ecokit.in",
  // Supplied by the client 2026-10-05.
  phone: "+91 74791 01230",
  phoneHref: "tel:+917479101230",
  phoneAlt: "+91 79085 89297",
  phoneAltHref: "tel:+917908589297",
  whatsappHref: "https://wa.me/917479101230",
  hours: "Mon – Sat, 9am – 6pm IST",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/hospitality", label: "Hospitality" },
  { href: "/custom-kits", label: "Custom Kits" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
