"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionState } from "@/app/account/actions";
import { Button } from "@/components/ui/button";

const initial: ActionState = { error: null };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="text-xs font-bold uppercase tracking-widest text-[#64748B]"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            className="w-full bg-white border border-[#E2E8F0] rounded px-4 py-3 text-[#0B0F14] outline-none focus:border-[#F9D20F] transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="text-xs font-bold uppercase tracking-widest text-[#64748B]"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            className="w-full bg-white border border-[#E2E8F0] rounded px-4 py-3 text-[#0B0F14] outline-none focus:border-[#F9D20F] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-widest text-[#64748B]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-white border border-[#E2E8F0] rounded px-4 py-3 text-[#0B0F14] outline-none focus:border-[#F9D20F] transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-bold uppercase tracking-widest text-[#64748B]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={5}
          autoComplete="new-password"
          className="w-full bg-white border border-[#E2E8F0] rounded px-4 py-3 text-[#0B0F14] outline-none focus:border-[#F9D20F] transition-colors"
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-12 bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
      >
        {pending ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-sm text-[#64748B] text-center">
        Already have an account?{" "}
        <Link href="/account/login" className="text-[#F9D20F] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
