import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-800">
      <div
        className="w-full max-w-sm relative rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800
        bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl p-8 flex flex-col gap-6 transition-all duration-300"
      >
        {/* Logo (circle) */}
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-white dark:bg-neutral-900 shadow-md p-2 w-24 h-24 flex items-center justify-center -mt-20 border-4 border-white dark:border-neutral-900">
            <img src="/logo.jpg" alt="Logo" className="h-16 w-16 object-contain rounded-full" />
          </div>
        </div>
        {/* Headline */}
        <div className="text-center mt-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white drop-shadow-sm">
            Welcome back!
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Sign in to your account
          </p>
        </div>
        {/* Form */}
        <form className="flex flex-col gap-4" autoComplete="off">
          <Input
            type="email"
            placeholder="Email"
            autoComplete="username"
            required
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 shadow-sm bg-white/70 dark:bg-neutral-900/70 transition"
          />
          <Input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 shadow-sm bg-white/70 dark:bg-neutral-900/70 transition"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-blue-500 focus:outline-none transition"
              />
              Remember mes
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-500 hover:underline hover:text-blue-600 transition"
            >
              Forgot?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full font-bold h-11 text-base rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg hover:scale-[1.03] hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-all duration-200"
          >
            Sign In
          </Button>
        </form>
      </div>
    </main>
  );
}
