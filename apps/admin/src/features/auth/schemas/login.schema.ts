import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
