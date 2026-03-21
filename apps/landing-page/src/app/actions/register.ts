"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const registerSchema = z.object({
  first_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  last_name: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres").max(100),
  state: z.string().length(2, "Selecione um estado"),
  phone: z.string().refine(
    (v) => v.replace(/\D/g, "").length >= 10,
    "Telefone inválido"
  ),
  email: z.string().email("Email inválido"),
  birth_date: z.string().optional().or(z.literal("")),
  invited_by: z.string().max(255).optional().or(z.literal("")),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export type RegisterActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitRegisterForm(
  formData: RegisterFormData
): Promise<RegisterActionResult> {
  try {
    const validated = registerSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        message: "Dados inválidos. Por favor, verifique os campos.",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { first_name, last_name, state, phone, email, birth_date, invited_by } = validated.data;
    const full_name = `${first_name.trim()} ${last_name.trim()}`;
    const emailNorm = email.trim().toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase env vars");
      throw new Error("Configuração do servidor incompleta");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Deduplicação por email
    const { data: existing, error: selectError } = await supabase
      .from("leads")
      .select("id, submission_count")
      .eq("email", emailNorm)
      .maybeSingle();

    if (selectError) {
      console.error("Supabase select error:", selectError);
      throw selectError;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          submission_count: existing.submission_count + 1,
          updated_at: new Date().toISOString(),
          state,
          ...(invited_by && { invited_by }),
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("leads").insert({
        full_name,
        email: emailNorm,
        phone,
        state,
        birth_date: birth_date || null,
        invited_by: invited_by || null,
        source: "landing-page",
        status: "new",
        priority: "medium",
      });

      if (insertError) throw insertError;
    }

    return {
      success: true,
      message: "Cadastro realizado com sucesso! Em breve entraremos em contato.",
    };
  } catch (error) {
    console.error("submitRegisterForm error:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao realizar seu cadastro. Tente novamente.",
    };
  }
}
