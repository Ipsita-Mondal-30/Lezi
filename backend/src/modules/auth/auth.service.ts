import { supabaseAdmin } from "../../config/supabase";
import { ERROR_CODES } from "../../shared/constants/error-codes";
import { AppError } from "../../shared/errors/AppError";
import type { ApplicationUser } from "./auth.types";

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

function mapUser(row: ApplicationUser): ApplicationUser {
  return {
    id: row.id,
    auth_id: row.auth_id,
    email: row.email,
    current_journey: row.current_journey,
    onboarding_completed: row.onboarding_completed,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function findUserByAuthId(
  authId: string
): Promise<ApplicationUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, auth_id, email, current_journey, onboarding_completed, created_at, updated_at"
    )
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) {
    throw new AppError(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to look up application user"
    );
  }

  return data ? mapUser(data as ApplicationUser) : null;
}

async function createApplicationUser(
  authId: string,
  email: string | null
): Promise<ApplicationUser> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      auth_id: authId,
      email,
    })
    .select(
      "id, auth_id, email, current_journey, onboarding_completed, created_at, updated_at"
    )
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      const existing = await findUserByAuthId(authId);
      if (existing) {
        return existing;
      }

      throw new AppError(
        409,
        ERROR_CODES.CONFLICT,
        "Application user already exists"
      );
    }

    throw new AppError(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to create application user"
    );
  }

  return mapUser(data as ApplicationUser);
}

export async function getOrCreateApplicationUser(
  authId: string,
  email: string | null
): Promise<ApplicationUser> {
  const existing = await findUserByAuthId(authId);
  if (existing) {
    return existing;
  }

  return createApplicationUser(authId, email);
}

export async function getAuthenticatedApplicationUser(
  authId: string,
  email: string | null
): Promise<ApplicationUser> {
  return getOrCreateApplicationUser(authId, email);
}
