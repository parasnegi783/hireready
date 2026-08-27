import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (data?.url) {
      window.location.href = data.url;
    }
    return { data, error };
  } catch (err: any) {
    return {
      data: { provider: "google" as const, url: null },
      error: { message: err?.message || "Failed to connect to Supabase. Check if your project is active/unpaused." } as any,
    };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err: any) {
    return {
      data: { user: null, session: null },
      error: { message: err?.message || "Failed to connect to Supabase auth service. Please check your Supabase project status." } as any,
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  role: "student" | "tpo" = "student"
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  } catch (err: any) {
    return {
      data: { user: null, session: null },
      error: { message: err?.message || "Failed to connect to Supabase auth service. Please check if your Supabase project is unpaused." } as any,
    };
  }
}

export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    return { data, error };
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || "Failed to request password reset. Check Supabase connection." } as any,
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: { message: err?.message || "Failed to sign out." } as any };
  }
}

export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

export async function getUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

