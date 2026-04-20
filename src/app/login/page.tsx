import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { LoginForm } from "./login-form";
import { AnimatedOrbs } from "@/components/effects/animated-orbs";
import { Meteors } from "@/components/effects/meteors";
import { Particles } from "@/components/effects/particles";
import { Spotlight } from "@/components/effects/spotlight";
import { TiltCard } from "@/components/effects/tilt-card";
import { GradientBorder } from "@/components/effects/gradient-border";

export const metadata = {
  title: "登录 · TaskFlow MVP",
  description: "使用邮箱与密码登录学习任务管理示例",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 50% -10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(900px 500px at 80% 110%, rgba(99,102,241,0.2), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />
      <AnimatedOrbs />
      <Particles count={60} />
      <Meteors count={12} />
      <Spotlight color="rgba(139, 92, 246, 0.22)" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="hero-pulse flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/40">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="title-glow bg-linear-to-br from-white via-zinc-200 to-violet-400 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
            TaskFlow
          </span>
          <span className="blink-caret ml-0.5 inline-block h-6 w-[2px] bg-violet-400" />
        </div>

        <TiltCard>
          <GradientBorder>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
              <Suspense
                fallback={
                  <p className="p-8 text-sm text-zinc-400">加载中…</p>
                }
              >
                <LoginForm dark />
              </Suspense>
            </div>
          </GradientBorder>
        </TiltCard>

        <p className="mt-5 text-center font-mono text-[11px] tracking-wider text-zinc-500">
          powered by Next.js 16 · Auth.js · Prisma · Neon
        </p>
      </div>
    </main>
  );
}
