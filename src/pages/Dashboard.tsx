import { useQuery } from '@tanstack/react-query';
import { getUsers, getPackageGroups, getRepositories, getPackages, getUsername } from '../lib/api';
import StatCard from '../components/StatCard';
import { Users, FolderTree, Database, Package } from 'lucide-react';

const ecosystems = ['php', 'npm', 'pypi', 'go'] as const;

export default function Dashboard() {
  const username = getUsername();

  const usersQ = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const groupsQ = useQuery({ queryKey: ['packageGroups'], queryFn: getPackageGroups });
  const reposQ = useQuery({ queryKey: ['repositories'], queryFn: getRepositories });

  const pkgQueries = ecosystems.map((eco) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['packages', eco],
      queryFn: () => getPackages(eco),
      retry: false,
    }),
  );

  return (
    <div>
      <p className="mb-6 text-lg text-gray-600">Welcome, <span className="font-semibold text-gray-900">{username}</span></p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users size={22} />}
          label="Total Users"
          value={usersQ.data?.count ?? 0}
          loading={usersQ.isLoading}
        />
        <StatCard
          icon={<FolderTree size={22} />}
          label="Package Groups"
          value={groupsQ.data?.count ?? 0}
          loading={groupsQ.isLoading}
        />
        <StatCard
          icon={<Database size={22} />}
          label="Repositories"
          value={reposQ.data?.count ?? 0}
          loading={reposQ.isLoading}
        />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Packages by Ecosystem</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ecosystems.map((eco, i) => (
          <StatCard
            key={eco}
            icon={<Package size={22} />}
            label={eco.toUpperCase()}
            value={pkgQueries[i].data?.count ?? 0}
            loading={pkgQueries[i].isLoading}
          />
        ))}
      </div>
    </div>
  );
}
