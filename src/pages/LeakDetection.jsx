import RiskScoreCard from "../components/leakDetection/RiskScoreCard";
import LeakSourceTable from "../components/leakDetection/LeakSourceTable";
import AIInsightCard from "../components/leakDetection/AIInsightCard";


export default function LeakDetection(){

return(

<div className="space-y-8">


{/* Header */}

<div>

<h1 className="text-3xl font-bold text-slate-800">
Leak Source Detection
</h1>

<p className="text-slate-500 mt-2">
AI powered analysis to identify possible question paper leak sources.
</p>

</div>



{/* Risk Cards */}

<RiskScoreCard />



{/* Leak Sources */}

<LeakSourceTable />



{/* AI Finding */}

<AIInsightCard />


</div>

)

}