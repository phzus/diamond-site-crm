import { z } from "zod";

/**
 * Contact Form Schema
 * Used for lead capture forms on the landing page
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  email: z
    .string()
    .email("Email inválido")
    .min(1, "Email é obrigatório"),

  phone: z
    .string()
    .regex(
      /^(\+55\s?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/,
      "Telefone inválido. Use o formato: (11) 99999-9999"
    )
    .optional()
    .or(z.literal("")),

  company: z
    .string()
    .max(100, "Nome da empresa deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),

  message: z
    .string()
    .min(10, "Mensagem deve ter pelo menos 10 caracteres")
    .max(1000, "Mensagem deve ter no máximo 1000 caracteres"),

  acceptPrivacy: z
    .boolean()
    .refine((val) => val === true, {
      message: "Você deve aceitar a política de privacidade",
    }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Newsletter Schema
 * Used for newsletter subscription forms
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .min(1, "Email é obrigatório"),

  acceptMarketing: z
    .boolean()
    .optional()
    .default(false),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
