import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const email = "info@markarydsbowling.se";
    
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser.users.find(user => user.email === email);
    
    if (userExists) {
      // User exists but email not confirmed - let's confirm it
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userExists.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        console.error("Error confirming email:", updateError);
        throw updateError;
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email confirmed for existing user",
          credentials: { email, password: "egTXzsi0pz51E6S", userId: userExists.id }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate a secure password  
    const password = "egTXzsi0pz51E6S";

    console.log("Creating new admin user:", email);

    // Create the user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        display_name: "Admin"
      }
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User creation failed - no user returned");
    }

    console.log("User created successfully:", authData.user.id);

    // The trigger should automatically add admin role, but let's make sure
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: authData.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error("Role assignment error:", roleError);
      // Don't throw - user is created, role might already exist
    }

    console.log("Admin user setup complete");

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email,
          password,
          userId: authData.user.id
        },
        message: "Admin user created successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error creating admin user:", error);
    
    // Check if user already exists
    if (error.message?.includes("already") || error.message?.includes("duplicate")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User already exists. Use password reset instead."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create admin user"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateSecurePassword(): string {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

serve(handler);