import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { timelineData } from "@/lib/constants";

export default function Expertise() {
  return (
    <div className="flex flex-col items-center justify-center bg-black h-svh">
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  );
}

