export default function ReportSummaryCard({
  title,
  value,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className={`text-3xl font-bold mt-3 ${color}`}>
        {value}
      </h2>

    </div>
  );
}