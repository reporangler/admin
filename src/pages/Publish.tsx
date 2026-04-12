import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { publishPackage, scanVcsUrl, getPackageGroups } from '../lib/api';
import { Upload, CheckCircle, AlertCircle, FileUp, X } from 'lucide-react';

type Ecosystem = 'npm' | 'pypi' | 'go' | 'php';

const ecoConfig: Record<Ecosystem, { label: string; accept: string; description: string }> = {
  npm: { label: 'NPM', accept: '.tgz', description: 'Drag & drop a .tgz package' },
  pypi: { label: 'PyPI', accept: '.whl,.tar.gz', description: 'Drag & drop a .whl or .tar.gz package' },
  go: { label: 'Go', accept: '.zip', description: 'Upload module zip with metadata' },
  php: { label: 'Composer (VCS)', accept: '', description: 'Enter a VCS repository URL to scan' },
};

export default function Publish() {
  const qc = useQueryClient();
  const [eco, setEco] = useState<Ecosystem>('npm');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [packageGroup, setPackageGroup] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Go-specific fields
  const [goModule, setGoModule] = useState('');
  const [goVersion, setGoVersion] = useState('');
  const [goMod, setGoMod] = useState('');

  // Composer-specific
  const [vcsUrl, setVcsUrl] = useState('');

  const groupsQ = useQuery({ queryKey: ['packageGroups'], queryFn: getPackageGroups });

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleSubmit() {
    setResult(null);
    setProgress(0);
    try {
      if (eco === 'php') {
        await scanVcsUrl(vcsUrl);
        setResult({ ok: true, msg: 'VCS repository scanned successfully' });
      } else {
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        if (packageGroup) fd.append('package_group', packageGroup);
        if (eco === 'go') {
          fd.append('module', goModule);
          fd.append('version', goVersion);
          fd.append('go_mod', goMod);
        }
        await publishPackage(eco, fd, setProgress);
        setResult({ ok: true, msg: 'Package published successfully' });
        qc.invalidateQueries({ queryKey: ['packages', eco] });
      }
      setFile(null);
      setProgress(null);
    } catch (err) {
      setProgress(null);
      setResult({ ok: false, msg: err instanceof Error ? err.message : 'Upload failed' });
    }
  }

  const cfg = ecoConfig[eco];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Ecosystem selector */}
      <div className="mb-6 flex rounded-lg bg-white shadow-sm">
        {(Object.keys(ecoConfig) as Ecosystem[]).map((e) => (
          <button
            key={e}
            onClick={() => { setEco(e); setFile(null); setResult(null); setProgress(null); }}
            className={`flex-1 px-4 py-2.5 text-sm font-medium first:rounded-l-lg last:rounded-r-lg ${
              eco === e ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {ecoConfig[e].label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* Package group selector */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Package Group</label>
          <select
            value={packageGroup}
            onChange={(e) => setPackageGroup(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">None</option>
            {groupsQ.data?.data.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>

        {eco === 'php' ? (
          /* Composer VCS form */
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">VCS Repository URL</label>
              <input
                value={vcsUrl}
                onChange={(e) => setVcsUrl(e.target.value)}
                placeholder="https://github.com/org/repo.git"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        ) : (
          <>
            {eco === 'go' && (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Module Path</label>
                  <input
                    value={goModule}
                    onChange={(e) => setGoModule(e.target.value)}
                    placeholder="github.com/org/module"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Version</label>
                  <input
                    value={goVersion}
                    onChange={(e) => setGoVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">go.mod</label>
                  <textarea
                    value={goMod}
                    onChange={(e) => setGoMod(e.target.value)}
                    rows={4}
                    placeholder="module github.com/org/module&#10;&#10;go 1.21"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            )}

            {/* File drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept={cfg.accept}
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <FileUp size={24} className="text-indigo-600" />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="rounded p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">{cfg.description}</p>
                  <p className="mt-1 text-xs text-gray-400">or click to browse</p>
                </>
              )}
            </div>
          </>
        )}

        {/* Progress bar */}
        {progress !== null && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">{progress}%</p>
          </div>
        )}

        {/* Result message */}
        {result && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
              result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {result.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {result.msg}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={eco === 'php' ? !vcsUrl.trim() : !file}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {eco === 'php' ? 'Scan Repository' : 'Publish Package'}
        </button>
      </div>
    </div>
  );
}
