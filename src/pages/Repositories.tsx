import { useQuery } from '@tanstack/react-query';
import { getRepositories, getPackages } from '../lib/api';
import { Link } from 'react-router-dom';
import { Database, Package, ArrowRight } from 'lucide-react';

const ecosystems = ['php', 'npm', 'pypi', 'go'] as const;

export default function Repositories() {
  const reposQ = useQuery({ queryKey: ['repositories'], queryFn: getRepositories });

  const pkgCounts = ecosystems.map((eco) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['packages', eco],
      queryFn: () => getPackages(eco),
      retry: false,
    }),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ecosystems.map((eco, i) => {
        const count = pkgCounts[i].data?.count ?? 0;
        const loading = pkgCounts[i].isLoading;

        return (
          <div key={eco} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <Database size={22} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{eco.toUpperCase()}</h3>
            </div>
            <div className="mb-4 flex items-center gap-2 text-gray-500">
              <Package size={16} />
              <span className="text-sm">
                {loading ? '...' : `${count} package${count !== 1 ? 's' : ''}`}
              </span>
            </div>
            <Link
              to={`/packages?eco=${eco}`}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View packages <ArrowRight size={14} />
            </Link>
          </div>
        );
      })}

      {reposQ.isLoading && (
        <p className="col-span-full text-center text-sm text-gray-400">Loading...</p>
      )}
    </div>
  );
}
