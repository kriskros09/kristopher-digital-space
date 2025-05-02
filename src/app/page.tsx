"use client";
import { AiChat } from "@/components/ui/chat/AiChat";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";
export default function Home() {
  return (

    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <CpuArchitecture className="hidden lg:block" />
        <AiChat  />
      </main>
  );
}
