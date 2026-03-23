'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadFormSchema, type LeadFormValues } from '../schemas/lead.schema'
import { useCreateLead } from '../hooks/useLeads'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, ChevronDown } from 'lucide-react'
import { useState } from 'react'

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

function formatCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (!d.length) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-white/25 focus:bg-white/8'
const labelCls = 'block text-[10px] font-light uppercase tracking-widest text-white/50 mb-1'

interface CreateLeadDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateLeadDialog({ open, onClose }: CreateLeadDialogProps) {
  const createLead = useCreateLead()
  const { data: currentUser } = useCurrentUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: { first_name: '', last_name: '', cpf: '', email: '', phone: '', state: null, city: '', birth_date: '', invited_by: '' },
  })

  const cpfReg = register('cpf')
  const phoneReg = register('phone')

  async function onSubmit(values: LeadFormValues) {
    const supabase = createClient()
    try {
      const lead = await createLead.mutateAsync({
        full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
        email: values.email,
        cpf: values.cpf ?? null,
        phone: values.phone ?? null,
        state: values.state ?? null,
        city: values.city ?? null,
        birth_date: values.birth_date ?? null,
        invited_by: values.invited_by ?? null,
        source: 'manual',
        status: 'new',
        priority: 'medium',
      })
      if (lead && currentUser) {
        await supabase.from('lead_activities').insert({
          lead_id: lead.id,
          action_type: 'created',
          to_value: 'manual',
          performed_by: currentUser.id,
        })
      }
      reset()
      onClose()
    } catch { /* handled by hook */ }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/8 outline-none max-h-[90vh] overflow-y-auto p-6 sm:p-8 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Close */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white outline-none"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <div className="mb-6 text-center">
            <Dialog.Title className="text-xl font-semibold tracking-wide text-white">
              NOVO CLIENTE
            </Dialog.Title>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
            {/* Nome | Sobrenome */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nome *</label>
                <input {...register('first_name')} placeholder="João" className={inputCls} />
                {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Sobrenome *</label>
                <input {...register('last_name')} placeholder="Silva" className={inputCls} />
                {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Telefone | Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Telefone</label>
                <input
                  {...phoneReg}
                  onChange={(e) => { e.target.value = formatPhone(e.target.value); phoneReg.onChange(e) }}
                  type="tel"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>E-mail *</label>
                <input {...register('email')} type="email" placeholder="joao@email.com" className={inputCls} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* CPF | Aniversário */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>CPF</label>
                <input
                  {...cpfReg}
                  onChange={(e) => { e.target.value = formatCpf(e.target.value); cpfReg.onChange(e) }}
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Aniversário</label>
                <input
                  {...register('birth_date')}
                  type="date"
                  className={inputCls}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Estado | Cidade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Estado</label>
                <div className="relative">
                  <select
                    value={watch('state') || ''}
                    onChange={(e) => setValue('state', e.target.value || null)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none transition-all focus:border-white/25 [&>option]:bg-zinc-900 [&>option]:text-white"
                  >
                    <option value="">Estado</option>
                    {BRAZILIAN_STATES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Cidade</label>
                <input {...register('city')} placeholder="São Paulo" className={inputCls} />
              </div>
            </div>

            {/* Indicação */}
            <div>
              <label className={labelCls}>Indicação</label>
              <input {...register('invited_by')} placeholder="Quem indicou?" className={inputCls} />
            </div>

            <button
              type="submit"
              disabled={createLead.isPending}
              className="mt-2 w-full cursor-pointer rounded-full bg-white py-4 text-sm font-medium text-black shadow-[0_0_30px_-8px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createLead.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </span>
              ) : 'CRIAR CLIENTE'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
