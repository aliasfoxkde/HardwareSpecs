export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-tertiary/30 rounded-lg p-2 text-center">
      <div className="text-[10px] text-text-muted uppercase">{label}</div>
      <div className="text-sm font-bold text-text-primary">{value}</div>
    </div>
  )
}
