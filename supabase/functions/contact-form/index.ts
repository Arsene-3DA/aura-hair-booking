import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  message: string;
  csrf_token?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Méthode non autorisée" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { name, email, message, csrf_token }: ContactFormRequest = await req.json();

    console.log("Contact form submission received:", { name, email: email?.substring(0, 5) + "...", messageLength: message?.length });

    // Validate the form using our secure database function
    const { data: validationResult, error: validationError } = await supabase.rpc(
      'submit_contact_form',
      {
        name: name?.trim(),
        email: email?.toLowerCase().trim(),
        message: message?.trim(),
        csrf_token
      }
    );

    if (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur de validation" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!validationResult?.success) {
      console.log("Validation failed:", validationResult?.error);
      return new Response(
        JSON.stringify({ success: false, error: validationResult?.error || "Données invalides" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email to business
    const businessEmailResponse = await resend.emails.send({
      from: "Tchiix Contact <noreply@resend.dev>",
      to: ["tchix3da@gmail.com"],
      subject: `Nouveau message de contact - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            Nouveau message de contact
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #6b7280;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Action requise:</strong> Répondre à ${email} dans les plus brefs délais.
            </p>
          </div>
        </div>
      `,
    });

    if (businessEmailResponse.error) {
      console.error("Failed to send business email:", businessEmailResponse.error);
      // Don't fail the request if business email fails
    } else {
      console.log("Business email sent successfully:", businessEmailResponse.data?.id);
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Tchiix <noreply@resend.dev>",
      to: [email],
      subject: "Merci pour votre message - Tchiix",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">Tchiix</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Votre salon de coiffure de confiance</p>
          </div>

          <div style="padding: 30px 20px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Bonjour ${name},</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.
            </p>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0; color: #047857;">
                <strong>✓ Votre message a été transmis à notre équipe</strong><br>
                Nous vous répondrons dans les plus brefs délais, généralement sous 24h.
              </p>
            </div>

            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              En attendant, n'hésitez pas à découvrir nos services et nos professionnels sur notre site web.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://tchiix.com" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Découvrir nos services
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">
              © 2024 Tchiix - Tous droits réservés<br>
              Si vous avez reçu cet email par erreur, vous pouvez l'ignorer en toute sécurité.
            </p>
          </div>
        </div>
      `,
    });

    if (userEmailResponse.error) {
      console.error("Failed to send user confirmation email:", userEmailResponse.error);
      // Don't fail the request if user email fails
    } else {
      console.log("User confirmation email sent successfully:", userEmailResponse.data?.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Message envoyé avec succès ! Nous vous répondrons bientôt." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in contact-form function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Une erreur s'est produite. Veuillez réessayer plus tard." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);