import { topRiskCenters } from "../../data/analyticsData";

export default function TopRiskCenters() {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800">
        Top High Risk Centers
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        AI Risk Score by Examination Center
      </p>

      <div className="mt-8 space-y-6">

        {topRiskCenters.map((item) => (

          <div key={item.center}>

            <div className="flex justify-between mb-2">

              <span className="font-medium text-slate-700">
                {item.center}
              </span>

              <span className="font-bold text-slate-800">
                {item.score}%
              </span>

            </div>

            <div className="w-full bg-slate-200 rounded-full h-3">

              <div
                className="bg-red-500 h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${item.score}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}