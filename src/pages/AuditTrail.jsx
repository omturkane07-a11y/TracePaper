import AuditStats from "../components/audit/AuditStats";
import AuditTimeline from "../components/audit/AuditTimeline";

export default function AuditTrail() {

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>

        <h1 className="text-3xl font-bold text-slate-800">
          Audit Trail Monitoring
        </h1>

        <p className="text-slate-500 mt-2">
          Track every activity and movement of examination papers.
        </p>

      </div>


      {/* Stats */}
      <AuditStats />


      {/* Timeline */}
      <AuditTimeline />


    </div>
  );
}