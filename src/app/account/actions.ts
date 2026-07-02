"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createCustomer,
  createCustomerAccessToken,
  deleteCustomerAccessToken,
  updateCustomer,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/queries/customer";
import {
  getCustomerToken,
  setCustomerToken,
  clearCustomerToken,
} from "@/lib/auth";

export type ActionState = { error: string | null; success?: boolean };

// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { token, errors } = await createCustomerAccessToken({
    email,
    password,
  });

  if (errors.length > 0 || !token) {
    return { error: errors[0]?.message ?? "Invalid email or password." };
  }

  await setCustomerToken(token.accessToken, token.expiresAt);
  redirect("/account");
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 5) {
    return { error: "Password must be at least 5 characters." };
  }

  const { errors } = await createCustomer({
    email,
    password,
    firstName,
    lastName,
  });

  if (errors.length > 0) {
    return { error: errors[0].message };
  }

  // Auto-login after successful registration
  const { token, errors: loginErrors } = await createCustomerAccessToken({
    email,
    password,
  });

  if (loginErrors.length > 0 || !token) {
    redirect("/account/login");
  }

  await setCustomerToken(token.accessToken, token.expiresAt);
  redirect("/account");
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const token = await getCustomerToken();
  if (token) {
    try {
      await deleteCustomerAccessToken(token);
    } catch {
      // Token may already be invalid — clear the cookie regardless
    }
  }
  await clearCustomerToken();
  redirect("/account/login");
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = await getCustomerToken();
  if (!token) return { error: "You are not logged in." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { errors } = await updateCustomer(token, {
    firstName,
    lastName,
    email,
    ...(phone ? { phone } : {}),
  });

  if (errors.length > 0) return { error: errors[0].message };

  revalidatePath("/account");
  return { error: null, success: true };
}

// ─── Addresses ───────────────────────────────────────────────────────────────

function addressFromForm(formData: FormData) {
  return {
    firstName: String(formData.get("firstName") ?? "").trim() || null,
    lastName: String(formData.get("lastName") ?? "").trim() || null,
    address1: String(formData.get("address1") ?? "").trim() || null,
    address2: String(formData.get("address2") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    province: String(formData.get("province") ?? "").trim() || null,
    country: String(formData.get("country") ?? "").trim() || null,
    zip: String(formData.get("zip") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
  };
}

export async function createAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = await getCustomerToken();
  if (!token) return { error: "You are not logged in." };

  const { errors } = await createCustomerAddress(token, addressFromForm(formData));
  if (errors.length > 0) return { error: errors[0].message };

  revalidatePath("/account/addresses");
  return { error: null, success: true };
}

export async function updateAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = await getCustomerToken();
  if (!token) return { error: "You are not logged in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing address id." };

  const { errors } = await updateCustomerAddress(
    token,
    id,
    addressFromForm(formData)
  );
  if (errors.length > 0) return { error: errors[0].message };

  revalidatePath("/account/addresses");
  return { error: null, success: true };
}

export async function deleteAddressAction(id: string): Promise<void> {
  const token = await getCustomerToken();
  if (!token) return;
  await deleteCustomerAddress(token, id);
  revalidatePath("/account/addresses");
}
