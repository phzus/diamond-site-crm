'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadFormSchema, type LeadFormValues } from '../schemas/lead.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Lead } from '../types/lead.types'

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' }, { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' }, { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' }, { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' }, { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

interface LeadFormProps {
  defaultValues?: Partial<LeadFormValues>
  onSubmit: (values: LeadFormValues) => void
  isLoading?: boolean
  submitLabel?: string
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function LeadForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: LeadFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: {
      first_name:  defaultValues?.first_name || '',
      last_name:   defaultValues?.last_name || '',
      cpf:         defaultValues?.cpf || '',
      email:       defaultValues?.email || '',
      phone:       defaultValues?.phone || '',
      state:       defaultValues?.state || null,
      city:        defaultValues?.city || '',
      birth_date:  defaultValues?.birth_date || '',
      invited_by:  defaultValues?.invited_by || '',
    },
  })

  const cpfReg = register('cpf')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
      {/* Nome | Sobrenome */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="first_name">Nome *</Label>
          <Input id="first_name" {...register('first_name')} placeholder="João" />
          {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="last_name">Sobrenome *</Label>
          <Input id="last_name" {...register('last_name')} placeholder="Silva" />
          {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>

      {/* Telefone | Email */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} placeholder="joao@email.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      {/* CPF | Aniversário */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            {...cpfReg}
            onChange={(e) => {
              e.target.value = formatCpf(e.target.value)
              cpfReg.onChange(e)
            }}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="birth_date">Aniversário</Label>
          <Input id="birth_date" type="date" {...register('birth_date')} />
        </div>
      </div>

      {/* Estado | Cidade */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select
            value={watch('state') || 'none'}
            onValueChange={(v) => setValue('state', v === 'none' ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não informado</SelectItem>
              {BRAZILIAN_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" {...register('city')} placeholder="São Paulo" />
        </div>
      </div>

      {/* Convidado por */}
      <div className="space-y-1">
        <Label htmlFor="invited_by">Convidado por</Label>
        <Input id="invited_by" {...register('invited_by')} placeholder="Nome de quem indicou" />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading
          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
          : submitLabel
        }
      </Button>
    </form>
  )
}
