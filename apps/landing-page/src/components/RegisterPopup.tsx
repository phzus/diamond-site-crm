"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { X, Loader2, CheckCircle2, ChevronDown, AlertCircle } from "lucide-react";
import { submitRegisterForm, type RegisterFormData } from "@/app/actions/register";

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const inputClass =
  "mt-0.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-helvetica text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-white/20 focus:bg-white/8";

interface RegisterPopupProps {
  open: boolean;
  onClose: () => void;
}

type Toast = { type: "success" | "error"; message: string } | null;

export function RegisterPopup({ open, onClose }: RegisterPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>();

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const phoneReg = register("phone", {
    required: "Telefone é obrigatório",
    validate: (v) => v.replace(/\D/g, "").length >= 10 || "Telefone inválido",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitRegisterForm(data);
      if (result.success) {
        setSuccess(true);
        reset();
        setToast({ type: "success", message: result.message });
      } else {
        setToast({ type: "error", message: result.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    reset();
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Panel */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] p-6 sm:p-8 backdrop-blur-2xl outline-none max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.85)",
          }}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white outline-none"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* Header */}
          <div className="mb-6 text-center">
            <Dialog.Title className="font-distrample text-2xl font-medium tracking-wide text-white">
              CADASTRO DIAMOND
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Formulário de cadastro Diamond
            </Dialog.Description>
          </div>

          {/* Success state */}
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-white/80" />
              <p className="font-helvetica text-base text-white/90">
                Cadastro realizado com sucesso!
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 cursor-pointer rounded-full border border-white/20 px-8 py-3 font-helvetica text-sm text-white transition-all hover:bg-white/10 outline-none"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nome / Sobrenome */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                    Nome *
                  </label>
                  <input
                    {...register("first_name", {
                      required: "Nome é obrigatório",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                    placeholder="João"
                    className={inputClass}
                  />
                  {errors.first_name && (
                    <p className="text-xs text-red-400">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                    Sobrenome *
                  </label>
                  <input
                    {...register("last_name", {
                      required: "Sobrenome é obrigatório",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                    placeholder="Silva"
                    className={inputClass}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-red-400">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Telefone | Aniversário */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                    Telefone *
                  </label>
                  <input
                    {...phoneReg}
                    onChange={(e) => {
                      e.target.value = formatPhone(e.target.value);
                      phoneReg.onChange(e);
                    }}
                    type="tel"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={inputClass}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                    Aniversário
                  </label>
                  <input
                    {...register("birth_date")}
                    type="date"
                    className={inputClass}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              {/* Estado | Cidade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                    Estado *
                  </label>
                  <div className="relative mt-0.5">
                    <select
                      {...register("state", { required: "Selecione seu estado" })}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 font-helvetica text-sm text-white outline-none transition-all focus:border-white/20 [&>option]:bg-zinc-900 [&>option]:text-white"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Estado
                      </option>
                      {BRAZILIAN_STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  </div>
                  {errors.state && (
                    <p className="text-xs text-red-400">{errors.state.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                    Cidade
                  </label>
                  <input
                    {...register("city")}
                    placeholder="São Paulo"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="space-y-1">
                <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                  E-mail *
                </label>
                <input
                  {...register("email", {
                    required: "E-mail é obrigatório",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "E-mail inválido",
                    },
                  })}
                  type="email"
                  placeholder="joao@email.com"
                  className={inputClass}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Indicação */}
              <div className="space-y-1">
                <label className="font-helvetica text-xs font-light uppercase tracking-widest text-white/50">
                  Indicação
                </label>
                <input
                  {...register("invited_by")}
                  placeholder="Quem te convidou?"
                  className={inputClass}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full cursor-pointer rounded-full bg-white py-4 font-helvetica text-sm font-medium text-black shadow-[0_0_30px_-8px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "EFETUAR CADASTRO"
                )}
              </button>

              <p className="text-center font-helvetica text-xs text-white/25">
                Seus dados estão protegidos e não serão compartilhados.
              </p>
            </form>
          )}
        </Dialog.Content>

        {/* Toast — renderizado fora do Content para posicionamento fixed correto */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[200] flex max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl transition-all sm:bottom-8 sm:right-8
              ${
                toast.type === "success"
                  ? "border-white/10 bg-white/10 text-white"
                  : "border-red-500/20 bg-black/80 text-red-400"
              }
            `}
          >
            {toast.type === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
            )}
            <p className="font-helvetica text-sm leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 shrink-0 text-white/30 hover:text-white/70 outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
