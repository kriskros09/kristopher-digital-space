"use client";
import { AiChat } from "@/components/ui/chat/AiChat";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export default function Home() {
  const { flags } = useFeatureFlags();
  return (

    <main className="bg-black flex flex-col gap-[32px] row-start-2 items-center sm:items-start h-screen">
      {flags.showCpuArchitecture?.value && (
        <CpuArchitecture className="hidden lg:block" />
      )}
      <AiChat />
    </main>
  );
}
