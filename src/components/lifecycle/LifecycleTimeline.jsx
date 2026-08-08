import { lifecycleData } from "../../data/lifecycleData";
import { CheckCircle, Clock, Circle } from "lucide-react";

export default function LifecycleTimeline() {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800">
        Paper Lifecycle
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Track the complete movement of the question paper
      </p>

      <div className="mt-8 space-y-6">

        {lifecycleData.map((item, index) => (

          <div
            key={index}
            className="flex items-start gap-4"
          >

            {/* Icon */}

            <div>

              {item.status === "completed" && (

                <CheckCircle
                  size={26}
                  className="text-green-600"
                />

              )}

              {item.status === "active" && (

                <Clock
                  size={26}
                  className="text-blue-600"
                />

              )}

              {item.status === "pending" && (

                <Circle
                  size={26}
                  className="text-slate-400"
                />

              )}

            </div>

            {/* Stage */}

            <div className="flex-1">

              <h3 className="font-semibold text-slate-800">
                {item.stage}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {item.time}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}