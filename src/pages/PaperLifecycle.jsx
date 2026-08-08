import PaperInfoCard from "../components/lifecycle/PaperInfoCard";
import CurrentStageCard from "../components/lifecycle/CurrentStageCard";
import LifecycleTimeline from "../components/lifecycle/LifecycleTimeline";
import LifecycleActivity from "../components/lifecycle/LifecycleActivity";

export default function PaperLifecycle() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Paper Lifecycle
        </h1>

        <p className="text-slate-500 mt-2">
          Track every stage of the question paper from creation to exam center.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PaperInfoCard />
        <CurrentStageCard />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LifecycleTimeline />
        <LifecycleActivity />
      </div>

    </div>
  );
}