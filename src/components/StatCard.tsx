import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  loading?: boolean;
}

export default function StatCard({ icon, label, value, loading }: StatCardProps) {
  return (
    <div className="rr-card p-6 transition-colors hover:border-[#3a3a3a]">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-[#FF6B35]/12 p-2 text-[#FF6B35]">{icon}</div>
        <span className="text-xs font-medium uppercase tracking-wider text-[#a0a0a0]">{label}</span>
      </div>
      <p className="font-mono text-3xl font-bold text-white">
        {loading ? (
          <span className="inline-block h-8 w-16 animate-pulse rounded bg-[#2a2a2a]" />
        ) : (
          value
        )}
      </p>
    </div>
  );
}
