export default function AuditEventCard({
title,
time,
description,
status
}){


return(

<div className="bg-white p-5 rounded-xl shadow-sm border">

<div className="flex justify-between items-center">


<h3 className="font-semibold text-slate-800">
{title}
</h3>


<span
className={`text-sm font-medium ${
status==="Alert"
?
"text-red-600"
:
"text-green-600"
}`}
>

{status}

</span>


</div>


<p className="text-sm text-slate-500 mt-2">
{description}
</p>


<p className="text-xs text-slate-400 mt-3">
{time}
</p>


</div>

)

}