"use server";

import { contactSchema, type ContactFormData } from "@/lib/schemas";

export type ContactActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * Server Action to handle contact form submissions
 * This simulates receiving a lead - in production, you would:
 * 1. Save to database (e.g., Supabase)
 * 2. Send notification email
 * 3. Integrate with CRM
 */
export async function submitContactForm(
  formData: ContactFormData
): Promise<ContactActionResult> {
  try {
    // Validate the form data on the server
    const validatedData = contactSchema.safeParse(formData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Dados inválidos. Por favor, verifique os campos.",
        errors: validatedData.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Simulate processing delay (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log the lead (replace with actual database insertion)
    console.log("📧 New lead received:", {
      name: validatedData.data.name,
      email: validatedData.data.email,
      phone: validatedData.data.phone || "Not provided",
      company: validatedData.data.company || "Not provided",
      message: validatedData.data.message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual lead storage
    // Example with Supabase:
    // const { error } = await supabase.from('leads').insert(validatedData.data);

    return {
      success: true,
      message: "Obrigado pelo contato! Retornaremos em breve.",
    };
  } catch (error) {
    console.error("Error processing contact form:", error);

    return {
      success: false,
      message: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
    };
  }
}
