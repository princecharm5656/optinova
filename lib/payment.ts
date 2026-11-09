// Payment and contact details shown on the /upgrade page.
// They come from Vercel environment variables, so no fake placeholder can ever reach a customer.
// NEXT_PUBLIC_ variables are baked in at build time: after changing them, Redeploy.
//
//   NEXT_PUBLIC_PAY_BANK_NAME        e.g. Meezan Bank
//   NEXT_PUBLIC_PAY_ACCOUNT_TITLE    name on the account
//   NEXT_PUBLIC_PAY_ACCOUNT_NUMBER   account number
//   NEXT_PUBLIC_PAY_IBAN             IBAN
//   NEXT_PUBLIC_PAY_SWIFT            SWIFT code (optional, for international transfers)
//   NEXT_PUBLIC_SUPPORT_EMAIL        an inbox you really read
//   NEXT_PUBLIC_WHATSAPP             digits only with country code, e.g. 923001234567 (optional)

const clean = (v: string | undefined) => (v ?? "").trim();

export const PAYMENT = {
  bankName: clean(process.env.NEXT_PUBLIC_PAY_BANK_NAME),
  accountTitle: clean(process.env.NEXT_PUBLIC_PAY_ACCOUNT_TITLE),
  accountNumber: clean(process.env.NEXT_PUBLIC_PAY_ACCOUNT_NUMBER),
  iban: clean(process.env.NEXT_PUBLIC_PAY_IBAN),
  swift: clean(process.env.NEXT_PUBLIC_PAY_SWIFT),
  supportEmail: clean(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
  whatsapp: clean(process.env.NEXT_PUBLIC_WHATSAPP).replace(/\D/g, ""),
};

/** The bank block is shown only when the essentials are really set. */
export const bankConfigured = !!(PAYMENT.bankName && PAYMENT.accountTitle && (PAYMENT.accountNumber || PAYMENT.iban));
