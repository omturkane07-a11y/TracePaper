import { Cpu, PlayCircle } from "lucide-react";

export default function AIProcessingCard() {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div className="flex items-center gap-3 mb-5">

        <Cpu
          className="text-blue-600"
          size={26}
        />

        <h2 className="text-xl font-bold">
          AI Processing
        </h2>

      </div>

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-3">

        <PlayCircle size={20} />

        Analyze Evidence

      </button>

      <p className="text-slate-500 mt-4 text-sm">

        AI will inspect uploaded evidence, metadata,
        timestamps and access history.

      </p>

    </div>

  );

}