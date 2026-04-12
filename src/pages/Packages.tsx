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
        <div className="flex rounded-lg bg-white shadow-sm">
          {ecosystems.map((e) => (
            <button
              key={e}
              onClick={() => { setEco(e); setExpanded(null); }}
              className={`px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg ${
                eco === e
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {e.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter packages..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Package Group</th>
              <th className="px-4 py-3">Storage Key</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <>
                <tr
                  key={p.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                >
                  <td className="px-4 py-3 text-gray-400">
                    {expanded === p.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.version}</td>
                  <td className="px-4 py-3 text-gray-600">{p.package_group}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.storage_key}</td>
                </tr>
                {expanded === p.id && (
                  <tr key={`${p.id}-def`}>
                    <td colSpan={5} className="bg-gray-50 px-6 py-4">
                      <p className="mb-2 text-xs font-medium uppercase text-gray-500">Definition</p>
                      <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                        {JSON.stringify(p.definition, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {pkgQ.isLoading && <p className="p-6 text-center text-sm text-gray-400">Loading...</p>}
        {!pkgQ.isLoading && filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No packages found</p>
        )}
      </div>
    </div>
  );
}
