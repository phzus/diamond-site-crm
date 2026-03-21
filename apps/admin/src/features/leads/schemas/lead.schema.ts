import { z } from 'zod'

export const leadFormSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(100, 'Sobrenome muito longo'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  phone: z.string().optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  invited_by: z.string().max(255).optional().nullable(),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>
