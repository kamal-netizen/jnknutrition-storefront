"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";
import type { CustomerAddress } from "@/lib/queries/customer";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  type ActionState,
} from "@/app/account/actions";
import { Button } from "@/components/ui/button";

const initial: ActionState = { error: null };

// ISO 3166-2:AE emirate codes used by Shopify for the "zone" field.
const EMIRATES = [
  { code: "DU", name: "Dubai" },
  { code: "AZ", name: "Abu Dhabi" },
  { code: "SH", name: "Sharjah" },
  { code: "AJ", name: "Ajman" },
  { code: "FU", name: "Fujairah" },
  { code: "RK", name: "Ras Al Khaimah" },
  { code: "UQ", name: "Umm Al Quwain" },
] as const;

// Common shipping destinations. Values are ISO 3166-1 alpha-2 codes.
const COUNTRIES = [
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
] as const;

type Field =
  | { name: string; label: string; type: "text" | "tel"; half: boolean }
  | {
      name: string;
      label: string;
      type: "select";
      half: boolean;
      options: readonly { code: string; name: string }[];
    };

const FIELDS: readonly Field[] = [
  { name: "firstName", label: "First Name", type: "text", half: true },
  { name: "lastName", label: "Last Name", type: "text", half: true },
  { name: "address1", label: "Address", type: "text", half: false },
  { name: "address2", label: "Apt, Suite (optional)", type: "text", half: false },
  { name: "city", label: "City", type: "text", half: true },
  { name: "zoneCode", label: "Emirate", type: "select", half: true, options: EMIRATES },
  { name: "territoryCode", label: "Country", type: "select", half: true, options: COUNTRIES },
  { name: "phoneNumber", label: "Phone (optional)", type: "tel", half: false },
] as const;

function AddressForm({
  address,
  onDone,
}: {
  address?: CustomerAddress;
  onDone: () => void;
}) {
  const action = address ? updateAddressAction : createAddressAction;
  const [state, formAction, pending] = useActionState(action, initial);

  if (state.success) {
    // Close form on success
    setTimeout(onDone, 0);
  }

  return (
    <form
      action={formAction}
      className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 space-y-4"
    >
      {address && <input type="hidden" name="id" value={address.id} />}

      {state.error && (
        <div className="rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map((field) => {
          const defaultValue = address
            ? ((address[field.name as keyof CustomerAddress] as string) ?? "")
            : field.type === "select"
              ? field.options[0].code
              : "";
          return (
            <div
              key={field.name}
              className={`space-y-1.5 ${field.half ? "col-span-1" : "col-span-2"}`}
            >
              <label
                htmlFor={field.name}
                className="text-xs font-bold uppercase tracking-widest text-[#64748B]"
              >
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  defaultValue={defaultValue}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-4 py-2.5 text-[#0B0F14] outline-none focus:border-[#F9D20F] transition-colors"
                >
                  {field.options.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  defaultValue={defaultValue}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-4 py-2.5 text-[#0B0F14] outline-none focus:border-[#F9D20F] transition-colors"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
        >
          {pending ? "Saving..." : address ? "Update Address" : "Add Address"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onDone}
          className="text-[#64748B] hover:text-[#0B0F14]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AddressManager({
  addresses,
}: {
  addresses: CustomerAddress[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      {/* Add new */}
      {adding ? (
        <AddressForm onDone={() => setAdding(false)} />
      ) : (
        <Button
          onClick={() => setAdding(true)}
          variant="outline"
          className="border-[#E2E8F0] text-[#0B0F14] hover:border-[#F9D20F]"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </Button>
      )}

      {/* Existing */}
      {addresses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) =>
            editingId === address.id ? (
              <div key={address.id} className="sm:col-span-2">
                <AddressForm
                  address={address}
                  onDone={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div
                key={address.id}
                className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 flex flex-col justify-between"
              >
                <address className="not-italic text-sm text-[#64748B] space-y-0.5">
                  {address.formatted.map((line, i) => (
                    <p key={i} className={i === 0 ? "text-[#0B0F14] font-semibold" : ""}>
                      {line}
                    </p>
                  ))}
                </address>
                <div className="flex gap-2 mt-4 pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setEditingId(address.id)}
                      className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#F9D20F] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <form action={deleteAddressAction.bind(null, address.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#EF4444] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        !adding && (
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
            <p className="text-[#64748B]">No saved addresses yet.</p>
          </div>
        )
      )}
    </div>
  );
}
