import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "任务列表 · TaskFlow MVP",
  description: "查看、筛选并管理你的任务（Server + Client 组合示例）",
  openGraph: {
    title: "TaskFlow MVP · 任务",
    description: "Next.js 全栈学习任务管理",
  },
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
