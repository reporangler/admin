import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPackages } from '../lib/api';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

const ecosystems = ['php', 'npm', 'pypi', 'go'] as const;

export default function Packages() {
  const [eco, setEco] = useState<(typeof ecosystems)[number]>('npm');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const pkgQ = useQuery({
    queryKey: ['packages', eco],
    queryFn: () => getPackages(eco),
  });

  const filtered = (pkgQ.data?.data ?? []).filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#212121]">
          {ecosystems.map((e) => (
            <button
              key={e}
              onClick={() => { setEco(e); setExpanded(null); }}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide transition-colors ${
                eco === e
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              {e.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter packages…"
            className="rr-input pl-9"
          />
        </div>
      </div>

      <div className="rr-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] bg-[#1A1A1A] text-xs uppercase tracking-wider text-[#666]">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Package Group</th>
              <th className="px-4 py-3">Storage Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {filtered.map((p) => (
              <>
                <tr
                  key={p.id}
                  className="cursor-pointer transition-colors hover:bg-[#2a2a2a]/50"
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                >
                  <td className="px-4 py-3 text-[#666]">
                    {expanded === p.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-[#00D4AA]">{p.version}</td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{p.package_group}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#666]">{p.storage_key}</td>
                </tr>
                {expanded === p.id && (
                  <tr key={`${p.id}-def`}>
                    <td colSpan={5} className="bg-[#1A1A1A] px-6 py-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#666]">
                        Definition
                      </p>
                      <pre className="max-h-64 overflow-auto rounded-lg border border-[#2a2a2a] bg-[#111111] p-4 text-xs text-[#00D4AA]">
                        {JSON.stringify(p.definition, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {pkgQ.isLoading && <p className="p-6 text-center text-sm text-[#666]">Loading…</p>}
        {!pkgQ.isLoading && filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-[#666]">No packages found</p>
        )}
      </div>
    </div>
  );
}
