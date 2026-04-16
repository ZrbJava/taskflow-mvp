"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-12">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-lg font-semibold text-red-800">任务页加载失败</h1>
        <p className="mt-2 text-sm text-red-700">
          {error.message || "请稍后重试，或检查数据库是否已初始化。"}
        </p>
        <Button type="button" className="mt-6" variant="secondary" onClick={reset}>
          重试
        </Button>
      </div>
    </main>
  );
}
