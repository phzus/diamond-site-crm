import { z } from 'zod'

export const leadFormSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  phone: z.string().optional().nullable(),
  message: z
    .string()
    .max(2000, 'Mensagem muito longa')
    .optional()
    .nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigned_to: z.string().optional().nullable(),
  invited_by: z.string().max(255).optional().nullable(),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>
