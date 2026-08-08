import {
ShieldAlert,
MapPin,
BadgeCheck,
FileText,
} from "lucide-react";

export default function AIResultCard() {

return (

<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

<h2 className="text-xl font-bold mb-6">
AI Analysis Report
</h2>

<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

<div className="bg-red-50 rounded-xl p-5">

<ShieldAlert className="text-red-600 mb-3" />

<p className="text-sm text-slate-500">
Leak Probability
</p>

<h2 className="text-3xl font-bold text-red-600">
92%
</h2>

</div>

<div className="bg-blue-50 rounded-xl p-5">

<MapPin className="text-blue-600 mb-3" />

<p className="text-sm text-slate-500">
Suspected Center
</p>

<h2 className="font-bold">
Pune Region
</h2>

</div>

<div className="bg-green-50 rounded-xl p-5">

<BadgeCheck className="text-green-600 mb-3" />

<p className="text-sm text-slate-500">
Confidence
</p>

<h2 className="text-3xl font-bold text-green-600">
96%
</h2>

</div>

<div className="bg-purple-50 rounded-xl p-5">

<FileText className="text-purple-600 mb-3" />

<p className="text-sm text-slate-500">
Recommendation
</p>

<h2 className="font-bold">
Immediate Audit
</h2>

</div>

</div>

</div>

);

}