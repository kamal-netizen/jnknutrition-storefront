"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  type CustomerAddressInput,
} from "@/lib/queries/customer";
import { getSession, clearSession, getValidAccessToken } from "@/lib/auth";
import { buildLogoutUrl, getOrigin } from "@/lib/customer-account";

export type ActionState = { error: string | null; success?: boolean };

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  await clearSession();

  if (session?.idToken) {
    const origin = await getOrigin();
    redirect(buildLogoutUrl(session.idToken, origin));
  }
  redirect("/account/login");
}

// ─── Addresses ───────────────────────────────────────────────────────────────

function addressFromForm(formData: FormData): CustomerAddressInput {
  const val = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v.length > 0 ? v : null;
  };
  return {
    firstName: val("firstName"),
    lastName: val("lastName"),
    address1: val("address1"),
    address2: val("address2"),
    city: val("city"),
    zoneCode: val("zoneCode"),
    territoryCode: val("territoryCode"),
    zip: val("zip"),
    phoneNumber: val("phoneNumber"),
  };
}

async function requireToken(): Promise<
  { token: string; origin: string } | { error: string }
> {
  const token = await getValidAccessToken();
  if (!token) return { error: "You are not logged in." };
  const origin = await getOrigin();
  return { token, origin };
}

export async function createAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireToken();
  if ("error" in auth) return { error: auth.error };

  const { errors } = await createCustomerAddress(
    auth.token,
    auth.origin,
    addressFromForm(formData)
  );
  if (errors.length > 0) return { error: errors[0].message };

  revalidatePath("/account/addresses");
  return { error: null, success: true };
}

export async function updateAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await requireToken();
  if ("error" in auth) return { error: auth.error };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing address id." };

  const { errors } = await updateCustomerAddress(
    auth.token,
    auth.origin,
    id,
    addressFromForm(formData)
  );
  if (errors.length > 0) return { error: errors[0].message };

  revalidatePath("/account/addresses");
  return { error: null, success: true };
}

export async function deleteAddressAction(id: string): Promise<void> {
  const auth = await requireToken();
  if ("error" in auth) return;
  await deleteCustomerAddress(auth.token, auth.origin, id);
  revalidatePath("/account/addresses");
}
