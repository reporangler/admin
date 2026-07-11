import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, deleteUser, grantAdmin, revokeAdmin } from '../lib/api';
import Modal from '../components/Modal';
import { Plus, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';

export default function Users() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const usersQ = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const createMut = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowCreate(false);
      setForm({ username: '', email: '', password: '' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setConfirmDelete(null);
    },
  });

  const adminMut = useMutation({
    mutationFn: ({ id, grant }: { id: number; grant: boolean }) =>
      grant ? grantAdmin(id) : revokeAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#a0a0a0]">
          <span className="font-mono font-semibold text-white">{usersQ.data?.count ?? 0}</span> users
        </p>
        <button onClick={() => setShowCreate(true)} className="rr-btn rr-btn-primary">
          <Plus size={16} /> Create User
        </button>
      </div>

      <div className="rr-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] bg-[#1A1A1A] text-xs uppercase tracking-wider text-[#666]">
            <tr>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Admin</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {usersQ.data?.data.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-[#2a2a2a]/50">
                <td className="px-6 py-3 font-medium text-white">{u.username}</td>
                <td className="px-6 py-3 text-[#a0a0a0]">{u.email}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => adminMut.mutate({ id: u.id, grant: !u.is_admin_user })}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      u.is_admin_user
                        ? 'bg-[#00D4AA]/12 text-[#00D4AA] hover:bg-[#00D4AA]/20'
                        : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#333]'
                    }`}
                  >
                    {u.is_admin_user ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                    {u.is_admin_user ? 'Admin' : 'User'}
                  </button>
                </td>
                <td className="px-6 py-3 text-right">
                  {confirmDelete === u.id ? (
                    <span className="flex items-center justify-end gap-2">
                      <span className="text-xs text-[#a0a0a0]">Confirm?</span>
                      <button
                        onClick={() => deleteMut.mutate(u.id)}
                        className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded bg-[#2a2a2a] px-2 py-1 text-xs font-medium text-[#a0a0a0] transition-colors hover:bg-[#333] hover:text-white"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(u.id)}
                      className="rounded-md p-1.5 text-[#666] transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usersQ.isLoading && <p className="p-6 text-center text-sm text-[#666]">Loading…</p>}
      </div>

      {/* Create user modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="rr-label">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="rr-input"
            />
          </div>
          <div>
            <label className="rr-label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rr-input"
            />
          </div>
          <div>
            <label className="rr-label">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="rr-input"
            />
          </div>
          {createMut.isError && <div className="rr-alert-error">{createMut.error.message}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rr-btn rr-btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={createMut.isPending} className="rr-btn rr-btn-primary">
              {createMut.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
