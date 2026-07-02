"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/account/actions";
import { Button } from "@/components/ui/button";

const initial: ActionState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
          {state.error}
        </div>
      )}

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
          autoComplete="current-password"
          className="w-full bg-white border border-[#E2E8F0] rounded px-4 py-3 text-[#0B0F14] outline-none focus:border-[#F9D20F] transition-colors"
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-12 bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
      >
        {pending ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-sm text-[#64748B] text-center">
        Don&apos;t have an account?{" "}
        <Link href="/account/register" className="text-[#F9D20F] font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
