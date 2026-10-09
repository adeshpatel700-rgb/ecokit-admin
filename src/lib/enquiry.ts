/** Shared (client + server) enquiry form definitions and validation. */

export type EnquiryKind = "contact" | "quote" | "order";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  options?: string[];
  /** Render full-width; otherwise fields are paired two-per-row */
  wide?: boolean;
  /** Extra regex check (after required/empty handling) */
  pattern?: RegExp;
  patternMessage?: string;
}

export const CONTACT_FIELDS: FieldDef[] = [
  { name: "name", label: "Your Name", type: "text", required: true, placeholder: "Rohan Mehta", autoComplete: "name" },
  { name: "email", label: "Email Address", type: "email", required: true, placeholder: "rohan@hotel.com", autoComplete: "email" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210", autoComplete: "tel" },
  { name: "business", label: "Business / Property Name", type: "text", placeholder: "The Grand Hotel", autoComplete: "organization" },
  {
    name: "subject", label: "What can we help with?", type: "select", wide: true,
    options: ["Hospitality Amenities (Bulk Order)", "Custom Kit Enquiry", "Laser Engraving", "Product Information", "Partnership Opportunity", "General Question"],
  },
  { name: "message", label: "Your Message", type: "textarea", required: true, wide: true, placeholder: "Tell us about your property, the products you're interested in, or any questions you have…" },
];

export const QUOTE_FIELDS: FieldDef[] = [
  { name: "name", label: "Your Name", type: "text", required: true, placeholder: "Full name", autoComplete: "name" },
  { name: "email", label: "Email Address", type: "email", required: true, placeholder: "your@email.com", autoComplete: "email" },
  { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true, placeholder: "+91 98765 43210", autoComplete: "tel" },
  { name: "business", label: "Business Name", type: "text", required: true, placeholder: "Hotel / Company name", autoComplete: "organization" },
  {
    name: "industry", label: "Industry", type: "select", required: true, wide: true,
    options: ["Hotel / Resort", "Boutique Hotel", "Airbnb / Villa", "Corporate Office", "Wellness Retreat / Spa", "Hospital / Healthcare", "Restaurant / Café", "Event / Conference", "Other"],
  },
  { name: "products", label: "Products You're Interested In", type: "text", wide: true, placeholder: "e.g. Bamboo Toothbrush, Natural Loofah, Hotel Kit…" },
  { name: "quantity", label: "Estimated Quantity", type: "select", options: ["100 – 500 units", "500 – 1,000 units", "1,000 – 5,000 units", "5,000+ units", "Monthly recurring"] },
  { name: "timeline", label: "Timeline", type: "select", options: ["Within 2 weeks", "Within a month", "1 – 3 months", "Flexible"] },
  {
    name: "branding", label: "Custom Branding?", type: "select", wide: true,
    options: ["Yes — laser engraving + custom packaging", "Packaging only", "Engraving only", "No custom branding needed", "Not sure yet"],
  },
  { name: "message", label: "Anything Else We Should Know?", type: "textarea", wide: true, placeholder: "Room count, existing supplier, budget range, specific requirements…" },
];

export const ORDER_FIELDS: FieldDef[] = [
  { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Full name", autoComplete: "name" },
  { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com", autoComplete: "email" },
  { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true, placeholder: "+91 98765 43210", autoComplete: "tel" },
  { name: "business", label: "Business Name (optional)", type: "text", placeholder: "For GST invoice", autoComplete: "organization" },
  { name: "address", label: "Delivery Address", type: "text", required: true, wide: true, placeholder: "House / building, street, area", autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", required: true, autoComplete: "address-level2" },
  { name: "state", label: "State", type: "text", required: true, autoComplete: "address-level1" },
  { name: "pincode", label: "PIN Code", type: "text", required: true, placeholder: "400053", autoComplete: "postal-code", pattern: /^\d{6}$/, patternMessage: "Enter a valid 6-digit PIN code." },
  { name: "message", label: "Order notes (optional)", type: "textarea", wide: true, placeholder: "Delivery instructions, gift message, GST number…" },
];

export const FIELDS: Record<EnquiryKind, FieldDef[]> = { contact: CONTACT_FIELDS, quote: QUOTE_FIELDS, order: ORDER_FIELDS };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s-]{7,20}$/;
const MAX_LEN = 2000;

export type EnquiryValues = Record<string, string>;
export type EnquiryErrors = Record<string, string>;

export function validateEnquiry(kind: EnquiryKind, values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const field of FIELDS[kind]) {
    const value = (values[field.name] ?? "").trim();
    if (field.required && !value) {
      errors[field.name] = `Please enter ${field.label.toLowerCase()}.`;
      continue;
    }
    if (!value) continue;
    if (value.length > MAX_LEN) errors[field.name] = `${field.label} is too long.`;
    else if (field.type === "email" && !EMAIL_RE.test(value)) errors[field.name] = "Please enter a valid email address.";
    else if (field.type === "tel" && !PHONE_RE.test(value)) errors[field.name] = "Please enter a valid phone number.";
    else if (field.pattern && !field.pattern.test(value)) errors[field.name] = field.patternMessage ?? "Invalid value.";
    else if (field.type === "select" && field.options && !field.options.includes(value)) errors[field.name] = "Please choose one of the options.";
  }
  return errors;
}
