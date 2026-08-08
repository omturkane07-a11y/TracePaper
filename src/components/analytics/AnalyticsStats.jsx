import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Brain,
} from "lucide-react";

const stats = [
  {
    title: "Total Cases",
    value: "248",
    icon: ShieldAlert,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "High Risk",
    value: "34",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Resolved",
    value: "192",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "AI Accuracy",
    value: "96%",
    icon: Brain,
    color: "bg-purple-100 text-purple-600",
  },
];

export default function AnalyticsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

      {stats.map((item) => {

        const Icon = item.icon;

        return (

          <div
            key={item.title}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-slate-500 text-sm">
                  {item.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {item.value}
                </h2>

              </div>

              <div className={`p-3 rounded-xl ${item.color}`}>
                <Icon size={28} />
              </div>

            </div>

          </div>

        );

      })}

    </div>
  );
}