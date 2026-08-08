import EvidenceUpload from "../components/ai/EvidenceUpload";
import AIProcessingCard from "../components/ai/AIProcessingCard";
import AIResultCard from "../components/ai/AIResultCard";

export default function AIAnalysis() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          AI Leak Analysis
        </h1>

        <p className="text-slate-500 mt-2">
          Upload evidence and let AI analyze possible paper leak sources.
        </p>
      </div>

      <EvidenceUpload />

      <AIProcessingCard />

      <AIResultCard />

    </div>
  );
}