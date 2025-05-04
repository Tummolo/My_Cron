// src/api/auth.ts

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export interface User {
  id: number;
  role: 'admin' | 'patient';
  username: string;
  nome: string | null;
  cognome: string | null;
}

export async function login(username: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Errore login');
  return data as User;
}
