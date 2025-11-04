import type { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseServer.js";
import { supabase } from "../lib/supabaseClient.js";

// validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(1).max(32).optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signup(req: Request, res: Response) {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.message });
    }
    const { email, password, username } = parseResult.data;

    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { username },
        email_confirm: true,
      });

    if (createError) {
      console.error("Supabase createUser error:", createError);
      return res
        .status(400)
        .json({ error: createError.message || "Failed to create user" });
    }

    return res.status(201).json({
      message: "User created",
      user: {
        id: (createdUser as any).id,
        email: (createdUser as any).email,
        user_metadata: (createdUser as any).user_metadata,
      },
    });
  } catch (err) {
    console.error("signup error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const parseResult = signInSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.message });
    }

    const { email, password } = parseResult.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const { user, session } = data;

    return res.status(200).json({
      message: "Successfully loged in!",
      user,
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
    });
  } catch (err) {
    console.error("signIn error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
