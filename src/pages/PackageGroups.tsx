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
          placeholder="New group name…"
          className="rr-input flex-1"
        />
        <button
          type="submit"
          disabled={createMut.isPending || !name.trim()}
          className="rr-btn rr-btn-primary"
        >
          <Plus size={16} /> Create
        </button>
      </form>

      {createMut.isError && <div className="mb-4 rr-alert-error">{createMut.error.message}</div>}

      <div className="rr-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] bg-[#1A1A1A] text-xs uppercase tracking-wider text-[#666]">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {groupsQ.data?.data.map((g) => (
              <tr key={g.id} className="transition-colors hover:bg-[#2a2a2a]/50">
                <td className="px-6 py-3 font-mono text-[#666]">{g.id}</td>
                <td className="px-6 py-3 font-medium text-white">{g.name}</td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => deleteMut.mutate(g.id)}
                    className="rounded-md p-1.5 text-[#666] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Delete group"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {groupsQ.isLoading && <p className="p-6 text-center text-sm text-[#666]">Loading…</p>}
        {!groupsQ.isLoading && (groupsQ.data?.data.length ?? 0) === 0 && (
          <p className="p-6 text-center text-sm text-[#666]">No package groups</p>
        )}
      </div>
    </div>
  );
}
