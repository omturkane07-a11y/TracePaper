export default function LeakSourceTable(){


const sources=[

{
name:"Printing Press",
risk:82
},

{
name:"Storage Facility",
risk:65
},

{
name:"Transport Unit",
risk:40
},

{
name:"Exam Center",
risk:20
}

];


return(

<div className="bg-white rounded-xl border shadow-sm p-6">


<h2 className="text-xl font-bold text-slate-800 mb-6">
Possible Leak Sources
</h2>



<div className="space-y-6">


{
sources.map((source,index)=>(


<div key={index}>


<div className="flex justify-between mb-2">

<span className="font-medium text-slate-700">
{source.name}
</span>


<span className="font-bold text-red-600">
{source.risk}% Risk
</span>


</div>



<div className="w-full bg-slate-200 rounded-full h-3">


<div

className="bg-red-500 h-3 rounded-full"

style={{
width:`${source.risk}%`
}}

>

</div>


</div>



</div>


))

}


</div>


</div>

)

}