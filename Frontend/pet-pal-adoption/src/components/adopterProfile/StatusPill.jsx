const STATUS_CLASS = {
  Pending: "pa-pill-pending",
  Accepted: "pa-pill-accepted",
  Rejected: "pa-pill-rejected",
};

export default function StatusPill({ status }) {
  const className = STATUS_CLASS[status] ?? "pa-pill-neutral";
  return <span className={className}>{status}</span>;
}

