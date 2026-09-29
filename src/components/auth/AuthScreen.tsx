import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { login, signup } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setBusy(false);
          return;
        }
        await signup(email, password, name.trim());
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-md">
        {/* Brand Logo & Name */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-950 p-2 shadow-lg">
            <img
              src="/logo.png"
              alt="VicharHub Logo"
              className="h-full w-full object-contain filter drop-shadow-xs"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            VicharHub
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            {mode === "login"
              ? "Welcome back. Log in to your workspace."
              : "Create an account to start writing and calculating."}
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={() => {
            window.location.href = "/api/auth/google";
          }}
          className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-700/80 bg-zinc-800/80 py-2.5 text-sm font-medium text-zinc-100 shadow-sm transition hover:bg-zinc-700/90 hover:border-zinc-600"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs uppercase tracking-wider text-zinc-500">or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 placeholder:text-zinc-500"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 placeholder:text-zinc-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="font-medium text-indigo-400 hover:text-indigo-300 underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="font-medium text-indigo-400 hover:text-indigo-300 underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
