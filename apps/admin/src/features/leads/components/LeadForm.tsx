'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadFormSchema, type LeadFormValues } from '../schemas/lead.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useUsers } from '@/features/users/hooks/useUsers'
import { Loader2 } from 'lucide-react'
import type { Lead } from '../types/lead.types'

interface LeadFormProps {
  defaultValues?: Partial<Lead>
  onSubmit: (values: LeadFormValues) => void
  isLoading?: boolean
  submitLabel?: string
}

export function LeadForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: LeadFormProps) {
  const { data: users } = useUsers()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: {
      full_name:   defaultValues?.full_name || '',
      email:       defaultValues?.email || '',
      phone:       defaultValues?.phone || '',
      message:     defaultValues?.message || '',
      priority:    defaultValues?.priority || 'medium',
      assigned_to: defaultValues?.assigned_to || null,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nome completo *</Label>
        <Input id="full_name" {...register('full_name')} placeholder="João da Silva" />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} placeholder="joao@email.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select
            value={watch('priority')}
            onValueChange={(v) => setValue('priority', v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Select
            value={watch('assigned_to') || 'unassigned'}
            onValueChange={(v) => setValue('assigned_to', v === 'unassigned' ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Não atribuído" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Não atribuído</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Observação inicial</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Informações adicionais sobre o lead..."
          rows={3}
          className="resize-none"
        />
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
