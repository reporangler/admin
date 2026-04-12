const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://auth.reporangler.localhost';
const METADATA_URL = import.meta.env.VITE_METADATA_URL || 'http://metadata.reporangler.localhost';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
}

export function getUsername(): string {
  return localStorage.getItem('username') || 'Admin';
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
  }
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response;
}

async function rawAuthFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
  }
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response;
}

// --- Types ---

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin_user: boolean;
}

export interface PackageGroup {
  id: number;
  name: string;
}

export interface Repository {
  id: number;
  name: string;
}

export interface Package {
  id: number;
  name: string;
  version: string;
  package_group: string;
  definition: unknown;
  storage_key: string;
}

export interface ListResponse<T> {
  count: number;
  data: T[];
}

// --- Auth ---

export async function login(username: string, password: string): Promise<void> {
  const response = await fetch(`${AUTH_URL}/login/api`, {
    method: 'GET',
    headers: {
      'reporangler-login-type': 'database',
      'reporangler-login-username': username,
      'reporangler-login-password': password,
    },
  });
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  const data = await response.json();
  setToken(data.token);
  localStorage.setItem('username', data.username || username);
}

// --- Users ---

export async function getUsers(): Promise<ListResponse<User>> {
  const res = await authFetch(`${AUTH_URL}/user`);
  return res.json();
}

export async function createUser(data: { username: string; email: string; password: string }): Promise<void> {
  await authFetch(`${AUTH_URL}/user`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<void> {
  await authFetch(`${AUTH_URL}/user/${id}`, { method: 'DELETE' });
}

export async function grantAdmin(id: number): Promise<void> {
  await authFetch(`${AUTH_URL}/permission/user/admin/${id}`, { method: 'PUT' });
}

export async function revokeAdmin(id: number): Promise<void> {
  await authFetch(`${AUTH_URL}/permission/user/admin/${id}`, { method: 'DELETE' });
}

// --- Package Groups ---

export async function getPackageGroups(): Promise<ListResponse<PackageGroup>> {
  const res = await authFetch(`${METADATA_URL}/package-group`);
  return res.json();
}

export async function createPackageGroup(name: string): Promise<void> {
  await authFetch(`${METADATA_URL}/package-group`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deletePackageGroup(id: number): Promise<void> {
  await authFetch(`${METADATA_URL}/package-group/${id}`, { method: 'DELETE' });
}

// --- Repositories ---

export async function getRepositories(): Promise<ListResponse<Repository>> {
  const res = await authFetch(`${METADATA_URL}/repository`);
  return res.json();
}

export async function createRepository(name: string): Promise<void> {
  await authFetch(`${METADATA_URL}/repository`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// --- Packages ---

export async function getPackages(repository: string): Promise<ListResponse<Package>> {
  const res = await authFetch(`${METADATA_URL}/package/${repository}`);
  return res.json();
}

// --- Publishing ---

export async function publishPackage(
  repository: string,
  formData: FormData,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const token = getToken();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${METADATA_URL}/package/${repository}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

export async function scanVcsUrl(url: string): Promise<void> {
  await rawAuthFetch(`${METADATA_URL}/package/php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}
