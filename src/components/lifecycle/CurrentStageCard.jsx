import { Truck, MapPin, User, Clock } from "lucide-react";

export default function CurrentStageCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Current Stage
      </h2>

      <div className="space-y-5">

        <div className="flex items-center gap-3">
          <Truck className="text-blue-600" size={20} />
          <div>
            <p className="text-sm text-slate-500">Current Stage</p>
            <p className="font-semibold">Transport</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="text-red-500" size={20} />
          <div>
            <p className="text-sm text-slate-500">Current Location</p>
            <p className="font-semibold">Ahmednagar District</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="text-green-600" size={20} />
          <div>
            <p className="text-sm text-slate-500">Responsible Officer</p>
            <p className="font-semibold">Officer Rahul Patil</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="text-orange-500" size={20} />
          <div>
            <p className="text-sm text-slate-500">Last Updated</p>
            <p className="font-semibold">12:20 PM</p>
          </div>
        </div>

      </div>

    </div>
  );
}