export default function RiskScoreCard(){

return(

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">


<div className="bg-white p-6 rounded-xl border shadow-sm">

<p className="text-slate-500">
Overall Leak Risk
</p>

<h2 className="text-3xl font-bold text-red-600 mt-2">
87%
</h2>

</div>



<div className="bg-white p-6 rounded-xl border shadow-sm">

<p className="text-slate-500">
AI Confidence
</p>

<h2 className="text-3xl font-bold text-blue-600 mt-2">
92%
</h2>

</div>



<div className="bg-white p-6 rounded-xl border shadow-sm">

<p className="text-slate-500">
Sources Analyzed
</p>

<h2 className="text-3xl font-bold text-green-600 mt-2">
24
</h2>

</div>


</div>

)

}