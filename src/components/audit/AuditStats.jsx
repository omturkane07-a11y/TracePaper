export default function AuditStats(){

return(

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">


<div className="bg-white p-6 rounded-xl shadow-sm border">

<h3 className="text-slate-500">
Total Events
</h3>

<p className="text-3xl font-bold text-blue-600 mt-2">
256
</p>

</div>



<div className="bg-white p-6 rounded-xl shadow-sm border">

<h3 className="text-slate-500">
Security Alerts
</h3>

<p className="text-3xl font-bold text-red-600 mt-2">
12
</p>

</div>



<div className="bg-white p-6 rounded-xl shadow-sm border">

<h3 className="text-slate-500">
Verified Actions
</h3>

<p className="text-3xl font-bold text-green-600 mt-2">
244
</p>

</div>


</div>

)

}