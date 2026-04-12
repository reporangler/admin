import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPackageGroups, createPackageGroup, deletePackageGroup } from '../lib/api';
import { Plus, Trash2 } from 'lucide-react';

export default function PackageGroups() {
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const groupsQ = useQuery({ queryKey: ['packageGroups'], queryFn: getPackageGroups });

  const createMut = useMutation({
    mutationFn: () => createPackageGroup(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packageGroups'] });
      setName('');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deletePackageGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packageGroups'] }),
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMut.mutate();
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New group name..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          disabled={createMut.isPending || !name.trim()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus size={16} /> Create
        </button>
      </form>

      {createMut.isError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{createMut.error.message}</div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {groupsQ.data?.data.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-500">{g.id}</td>
                <td className="px-6 py-3 font-medium text-gray-900">{g.name}</td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => deleteMut.mutate(g.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {groupsQ.isLoading && <p className="p-6 text-center text-sm text-gray-400">Loading...</p>}
        {!groupsQ.isLoading && (groupsQ.data?.data.length ?? 0) === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No package groups</p>
        )}
      </div>
    </div>
  );
}
