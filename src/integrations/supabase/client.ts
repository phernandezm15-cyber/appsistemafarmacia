/**
 * Client for FarmaciaDB connecting directly to Cloud SQL PostgreSQL REST API,
 * with resilient offline fallback and JWT session management.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const hasRealSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Fallback seed definitions if completely offline before first fetch
const INITIAL_MEDS = [
  { id: 'MED-001', codigo: '75010000010', nombre: 'Panadol Extra', principio: 'Paracetamol 500mg', categoria: 'Analgésicos', caducidad: new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10), precio_compra: 8.5, precio_venta: 14, stock: 120 },
  { id: 'MED-002', codigo: '75010079191', nombre: 'Advil', principio: 'Ibuprofeno 400mg', categoria: 'Antiinflamatorios', caducidad: new Date(Date.now() + 300 * 86400000).toISOString().slice(0, 10), precio_compra: 12, precio_venta: 19.5, stock: 85 },
  { id: 'MED-003', codigo: '75010158382', nombre: 'Amoxil', principio: 'Amoxicilina 500mg', categoria: 'Antibióticos', caducidad: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10), precio_compra: 35, precio_venta: 55, stock: 6 },
  { id: 'MED-004', codigo: '75010237573', nombre: 'Clarityne', principio: 'Loratadina 10mg', categoria: 'Antihistamínicos', caducidad: new Date(Date.now() + 250 * 86400000).toISOString().slice(0, 10), precio_compra: 22, precio_venta: 34, stock: 48 },
  { id: 'MED-005', codigo: '75010316764', nombre: 'Omeprazol MK', principio: 'Omeprazol 20mg', categoria: 'Gastrointestinal', caducidad: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10), precio_compra: 15, precio_venta: 25, stock: 64 },
  { id: 'MED-006', codigo: '75010395955', nombre: 'Losartán Denk', principio: 'Losartán 50mg', categoria: 'Cardiovascular', caducidad: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10), precio_compra: 28, precio_venta: 42, stock: 8 },
  { id: 'MED-007', codigo: '75010475146', nombre: 'Centrum', principio: 'Multivitamínico', categoria: 'Vitaminas', caducidad: new Date(Date.now() + 500 * 86400000).toISOString().slice(0, 10), precio_compra: 95, precio_venta: 139, stock: 30 },
  { id: 'MED-008', codigo: '75010554337', nombre: 'Ventolin', principio: 'Salbutamol 100mcg', categoria: 'Respiratorio', caducidad: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10), precio_compra: 48, precio_venta: 72, stock: 22 },
  { id: 'MED-009', codigo: '75010633528', nombre: 'Aspirina Bayer', principio: 'Ácido acetilsalicílico', categoria: 'Analgésicos', caducidad: new Date(Date.now() + 600 * 86400000).toISOString().slice(0, 10), precio_compra: 6, precio_venta: 10, stock: 150 },
  { id: 'MED-010', codigo: '75010712719', nombre: 'Cipro', principio: 'Ciprofloxacino 500mg', categoria: 'Antibióticos', caducidad: new Date(Date.now() + 210 * 86400000).toISOString().slice(0, 10), precio_compra: 40, precio_venta: 62, stock: 5 },
  { id: 'MED-011', codigo: '75010791900', nombre: 'Voltaren', principio: 'Diclofenaco 50mg', categoria: 'Antiinflamatorios', caducidad: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10), precio_compra: 18, precio_venta: 29, stock: 40 },
  { id: 'MED-012', codigo: '75010871091', nombre: 'Allegra', principio: 'Fexofenadina 180mg', categoria: 'Antihistamínicos', caducidad: new Date(Date.now() + 320 * 86400000).toISOString().slice(0, 10), precio_compra: 45, precio_venta: 68, stock: 26 },
  { id: 'MED-013', codigo: '75010950282', nombre: 'Gaviscon', principio: 'Alginato de sodio', categoria: 'Gastrointestinal', caducidad: new Date(Date.now() + 140 * 86400000).toISOString().slice(0, 10), precio_compra: 38, precio_venta: 58, stock: 18 },
  { id: 'MED-014', codigo: '75011029473', nombre: 'Redoxon', principio: 'Vitamina C 1g', categoria: 'Vitaminas', caducidad: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10), precio_compra: 30, precio_venta: 46, stock: 55 },
  { id: 'MED-015', codigo: '75011108664', nombre: 'Atorvastatina MK', principio: 'Atorvastatina 20mg', categoria: 'Cardiovascular', caducidad: new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10), precio_compra: 32, precio_venta: 50, stock: 9 },
  { id: 'MED-016', codigo: '75011187855', nombre: 'Bepanthen', principio: 'Dexpantenol 5%', categoria: 'Dermatológicos', caducidad: new Date(Date.now() + 420 * 86400000).toISOString().slice(0, 10), precio_compra: 42, precio_venta: 65, stock: 35 },
  { id: 'MED-017', codigo: '75011267046', nombre: 'Glucophage', principio: 'Metformina 850mg', categoria: 'Diabetes', caducidad: new Date(Date.now() + 380 * 86400000).toISOString().slice(0, 10), precio_compra: 26, precio_venta: 40, stock: 70 },
  { id: 'MED-018', codigo: '75011346237', nombre: 'Mucosolvan', principio: 'Ambroxol 30mg', categoria: 'Respiratorio', caducidad: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10), precio_compra: 33, precio_venta: 49, stock: 14 },
  { id: 'MED-019', codigo: '75011425428', nombre: 'Fucidin', principio: 'Ácido fusídico 2%', categoria: 'Dermatológicos', caducidad: new Date(Date.now() + 260 * 86400000).toISOString().slice(0, 10), precio_compra: 55, precio_venta: 82, stock: 3 },
  { id: 'MED-020', codigo: '75011504619', nombre: 'Januvia', principio: 'Sitagliptina 100mg', categoria: 'Diabetes', caducidad: new Date(Date.now() + 500 * 86400000).toISOString().slice(0, 10), precio_compra: 210, precio_venta: 295, stock: 12 },
];

const INITIAL_PROVS = [
  { id: 'PRV-001', empresa: 'Droguería Centroamericana', contacto: 'Luis Méndez', telefono: '2245-1100', correo: 'ventas@drocen.gt', direccion: 'Zona 9, Ciudad de Guatemala' },
  { id: 'PRV-002', empresa: 'Laboratorios Bonin', contacto: 'Ana Castillo', telefono: '2380-4422', correo: 'pedidos@bonin.gt', direccion: 'Zona 12, Ciudad de Guatemala' },
  { id: 'PRV-003', empresa: 'Farmasa Distribuciones', contacto: 'Carlos Rivera', telefono: '2421-7788', correo: 'info@farmasa.com', direccion: 'Mixco, Guatemala' },
  { id: 'PRV-004', empresa: 'MediPharma GT', contacto: 'Sofía Herrera', telefono: '2290-3355', correo: 'contacto@medipharma.gt', direccion: 'Zona 10, Ciudad de Guatemala' },
  { id: 'PRV-005', empresa: 'Grupo Selecta Salud', contacto: 'Jorge Pérez', telefono: '7765-0099', correo: 'selecta@salud.gt', direccion: 'Quetzaltenango' },
];

const INITIAL_CLIENTS = [
  { id: 'CLI-001', nombre: 'Ana Morales', telefono: '5512-3344', nit: '4589632-1', puntos: 45 },
  { id: 'CLI-002', nombre: 'Carlos Juárez', telefono: '5523-8899', nit: 'CF', puntos: 10 },
  { id: 'CLI-003', nombre: 'Lucía Barrios', telefono: '4456-7788', nit: '7845123-6', puntos: 120 },
  { id: 'CLI-004', nombre: 'Pedro Gómez', telefono: '5590-1122', nit: '1234567-8', puntos: 0 },
  { id: 'CLI-005', nombre: 'María Fernanda Ruiz', telefono: '3345-6677', nit: '9988776-5', puntos: 75 },
  { id: 'CLI-006', nombre: 'José Ramírez', telefono: '5567-0011', nit: 'CF', puntos: 20 },
  { id: 'CLI-007', nombre: 'Elena Castillo', telefono: '4478-2233', nit: '5566778-9', puntos: 200 },
  { id: 'CLI-008', nombre: 'Diego Hernández', telefono: '5501-9988', nit: '3322114-0', puntos: 35 },
  { id: 'CLI-009', nombre: 'Sofía Pérez', telefono: '3390-4455', nit: 'CF', puntos: 5 },
  { id: 'CLI-010', nombre: 'Ricardo López', telefono: '5544-6677', nit: '6677889-1', puntos: 60 },
];

const INITIAL_USERS = [
  { id: 'usr-admin', email: 'admin@farmacia.gt', password: 'admin123', nombre: 'Admin General', role: 'admin' },
  { id: 'usr-emp', email: 'empleado@farmacia.gt', password: 'empleado123', nombre: 'María López', role: 'empleado' },
];

const INITIAL_COMPRAS = [
  { id: 'CMP-001', codigo: 'CMP-001', fecha: new Date(Date.now() - 1 * 86400000).toISOString(), proveedor_id: 'PRV-001', med_id: 'MED-003', cantidad: 50, costo: 35, estado: 'Pendiente', nota: 'Entrega programada' },
  { id: 'CMP-002', codigo: 'CMP-002', fecha: new Date(Date.now() - 3 * 86400000).toISOString(), proveedor_id: 'PRV-002', med_id: 'MED-001', cantidad: 100, costo: 8.5, estado: 'Completado', nota: null },
  { id: 'CMP-003', codigo: 'CMP-003', fecha: new Date(Date.now() - 6 * 86400000).toISOString(), proveedor_id: 'PRV-004', med_id: 'MED-007', cantidad: 20, costo: 95, estado: 'Completado', nota: null },
  { id: 'CMP-004', codigo: 'CMP-004', fecha: new Date(Date.now() - 8 * 86400000).toISOString(), proveedor_id: 'PRV-003', med_id: 'MED-010', cantidad: 40, costo: 40, estado: 'Pendiente', nota: null },
  { id: 'CMP-005', codigo: 'CMP-005', fecha: new Date(Date.now() - 12 * 86400000).toISOString(), proveedor_id: 'PRV-001', med_id: 'MED-009', cantidad: 80, costo: 6, estado: 'Completado', nota: null },
  { id: 'CMP-006', codigo: 'CMP-006', fecha: new Date(Date.now() - 15 * 86400000).toISOString(), proveedor_id: 'PRV-005', med_id: 'MED-017', cantidad: 60, costo: 26, estado: 'Completado', nota: null },
];

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(`farmaciadb_${key}`);
  if (!raw) {
    localStorage.setItem(`farmaciadb_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStore<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`farmaciadb_${key}`, JSON.stringify(value));
  }
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('farmaciadb_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- CLOUD SQL POSTGRESQL CLIENT WRAPPER ---
class CloudSQLDatabaseClient {
  private authListeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    // Initialize default local user if none
    if (typeof window !== 'undefined' && !localStorage.getItem('farmaciadb_current_user')) {
      localStorage.setItem('farmaciadb_current_user', JSON.stringify(INITIAL_USERS[0]));
    }
  }

  get auth() {
    return {
      getUser: async () => {
        const u = getStore<any | null>('current_user', null);
        return { data: { user: u ? { id: String(u.id), email: u.email } : null }, error: null };
      },
      getSession: async () => {
        const u = getStore<any | null>('current_user', null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('farmaciadb_jwt_token') || 'local-token' : 'local-token';
        return {
          data: {
            session: u
              ? {
                  user: { id: String(u.id), email: u.email },
                  access_token: token,
                }
              : null,
          },
          error: null,
        };
      },
      signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.token && typeof window !== 'undefined') {
              localStorage.setItem('farmaciadb_jwt_token', data.token);
            }
            const loggedUser = {
              id: String(data.user.id),
              email: data.user.email,
              nombre: data.user.nombre,
              role: data.user.role,
            };
            setStore('current_user', loggedUser);
            this.notifyAuth('SIGNED_IN', { user: loggedUser });
            return {
              data: { user: loggedUser, session: { user: loggedUser } },
              error: null,
            };
          }
        } catch (err) {
          console.warn('[Auth Fallback] Error connecting to /api/auth/login, checking local credentials:', err);
        }

        // Local fallback
        const users = getStore<any[]>('users', INITIAL_USERS);
        const match = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim() && (!password || u.password === password)
        );
        if (!match) {
          return { data: { user: null, session: null }, error: new Error('Credenciales incorrectas') };
        }
        setStore('current_user', match);
        this.notifyAuth('SIGNED_IN', { user: { id: String(match.id), email: match.email } });
        return {
          data: {
            user: { id: String(match.id), email: match.email },
            session: { user: { id: String(match.id), email: match.email } },
          },
          error: null,
        };
      },
      signUp: async ({ email, password, options }: any) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              password,
              nombre: options?.data?.nombre || 'Usuario',
              role: options?.data?.rol === 'admin' ? 'admin' : 'empleado',
              adminAuthKey: options?.data?.adminAuthKey,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.token && typeof window !== 'undefined') {
              localStorage.setItem('farmaciadb_jwt_token', data.token);
            }
            const newUser = {
              id: String(data.user.id),
              email: data.user.email,
              nombre: data.user.nombre,
              role: data.user.role,
            };
            setStore('current_user', newUser);
            return { data: { user: newUser }, error: null };
          }
        } catch (err) {
          console.warn('[Auth Register Fallback] /api/auth/register error, saving locally:', err);
        }

        // Local fallback
        const users = getStore<any[]>('users', INITIAL_USERS);
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim());
        if (exists) {
          return { data: { user: null }, error: new Error('Este correo ya está registrado') };
        }
        const newUser = {
          id: `usr-${Date.now()}`,
          email: email.trim(),
          password,
          nombre: options?.data?.nombre || 'Usuario',
          role: options?.data?.rol === 'admin' ? 'admin' : 'empleado',
        };
        users.push(newUser);
        setStore('users', users);
        return { data: { user: { id: newUser.id, email: newUser.email } }, error: null };
      },
      signOut: async () => {
        setStore('current_user', null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('farmaciadb_jwt_token');
        }
        this.notifyAuth('SIGNED_OUT', null);
        return { error: null };
      },
      onAuthStateChange: (cb: (ev: string, session: any) => void) => {
        this.authListeners.push(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                this.authListeners = this.authListeners.filter((l) => l !== cb);
              },
            },
          },
        };
      },
    };
  }

  private notifyAuth(event: string, session: any) {
    this.authListeners.forEach((l) => l(event, session));
  }

  private async fetchTableData(tableName: string): Promise<any[]> {
    try {
      if (tableName === 'medicamentos') {
        const res = await fetch('/api/medicamentos', { headers: getAuthHeader() });
        if (res.ok) {
          const list = await res.json();
          setStore('meds', list);
          return list;
        }
      } else if (tableName === 'clientes') {
        const res = await fetch('/api/clientes', { headers: getAuthHeader() });
        if (res.ok) {
          const list = await res.json();
          setStore('clients', list);
          return list;
        }
      } else if (tableName === 'proveedores') {
        const res = await fetch('/api/proveedores', { headers: getAuthHeader() });
        if (res.ok) {
          const list = await res.json();
          setStore('provs', list);
          return list;
        }
      } else if (tableName === 'compras') {
        const res = await fetch('/api/compras', { headers: getAuthHeader() });
        if (res.ok) {
          const list = await res.json();
          setStore('compras', list);
          return list;
        }
      } else if (tableName === 'ventas') {
        const res = await fetch('/api/ventas', { headers: getAuthHeader() });
        if (res.ok) {
          const list = await res.json();
          setStore('ventas', list);
          return list;
        }
      } else if (tableName === 'profiles') {
        const res = await fetch('/api/auth/users', { headers: getAuthHeader() });
        if (res.ok) {
          const list = await res.json();
          return list.map((u: any) => ({
            id: String(u.id),
            nombre: u.nombre,
            email: u.email,
            role: u.role,
            created_at: u.createdAt || '2026-01-01',
          }));
        }
      } else if (tableName === 'user_roles') {
        const res = await fetch('/api/auth/users', { headers: getAuthHeader() });
        if (res.ok) {
          const list = await res.json();
          return list.map((u: any) => ({
            user_id: String(u.id),
            role: u.role,
          }));
        }
      }
    } catch (e) {
      console.warn(`[Backend fallback] Fetching ${tableName} failed, falling back to cached local storage:`, e);
    }

    // Fallback to localStorage cache
    if (tableName === 'medicamentos') return getStore('meds', INITIAL_MEDS);
    if (tableName === 'proveedores') return getStore('provs', INITIAL_PROVS);
    if (tableName === 'clientes') return getStore('clients', INITIAL_CLIENTS);
    if (tableName === 'compras') return getStore('compras', INITIAL_COMPRAS);
    if (tableName === 'ventas') return getStore('ventas', []);
    if (tableName === 'profiles') {
      const users = getStore('users', INITIAL_USERS);
      return users.map((u: any) => ({
        id: String(u.id),
        nombre: u.nombre,
        email: u.email,
        role: u.role,
        created_at: u.created_at || '2026-01-01',
      }));
    }
    if (tableName === 'user_roles') {
      const users = getStore('users', INITIAL_USERS);
      return users.map((u: any) => ({ user_id: String(u.id), role: u.role }));
    }
    return [];
  }

  from(tableName: string) {
    let filters: ((item: any) => boolean)[] = [];
    let sortFn: ((a: any, b: any) => number) | null = null;
    let limitCount: number | null = null;

    const executeQuery = async () => {
      let res = await this.fetchTableData(tableName);
      for (const f of filters) res = res.filter(f);
      if (sortFn) res.sort(sortFn);
      if (limitCount != null) res = res.slice(0, limitCount);
      return res;
    };

    const builder: any = {
      select: (_cols?: string) => builder,
      eq: (col: string, val: any) => {
        filters.push((item: any) => String(item[col]) === String(val));
        return builder;
      },
      order: (col: string, opts?: { ascending?: boolean }) => {
        const asc = opts?.ascending !== false;
        sortFn = (a: any, b: any) => {
          if (a[col] < b[col]) return asc ? -1 : 1;
          if (a[col] > b[col]) return asc ? 1 : -1;
          return 0;
        };
        return builder;
      },
      limit: (n: number) => {
        limitCount = n;
        return builder;
      },
      maybeSingle: async () => {
        const res = await executeQuery();
        return { data: res[0] ?? null, error: null };
      },
      single: async () => {
        const res = await executeQuery();
        return { data: res[0] ?? null, error: null };
      },
      insert: async (rowOrRows: any) => {
        const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
        const results: any[] = [];

        for (const row of rows) {
          try {
            if (tableName === 'medicamentos') {
              const res = await fetch('/api/medicamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(row),
              });
              if (res.ok) {
                const inserted = await res.json();
                results.push(inserted);
                continue;
              }
            } else if (tableName === 'clientes') {
              const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(row),
              });
              if (res.ok) {
                const inserted = await res.json();
                results.push(inserted);
                continue;
              }
            } else if (tableName === 'proveedores') {
              const res = await fetch('/api/proveedores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(row),
              });
              if (res.ok) {
                const inserted = await res.json();
                results.push(inserted);
                continue;
              }
            } else if (tableName === 'compras') {
              const res = await fetch('/api/compras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(row),
              });
              if (res.ok) {
                const inserted = await res.json();
                results.push(inserted);
                continue;
              }
            }
          } catch (e) {
            console.warn(`[Insert backend failed, using local store] ${tableName}:`, e);
          }

          // Fallback to local
          const key = tableName === 'medicamentos' ? 'meds' : tableName === 'proveedores' ? 'provs' : tableName === 'clientes' ? 'clients' : tableName;
          const currentList = getStore<any[]>(key, []);
          const id = row.id || `${key.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
          const inserted = { ...row, id };
          currentList.push(inserted);
          setStore(key, currentList);
          results.push(inserted);
        }

        return { data: results, error: null };
      },
      update: (fields: any) => {
        return {
          eq: async (col: string, val: any) => {
            try {
              if (tableName === 'medicamentos') {
                await fetch('/api/medicamentos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                  body: JSON.stringify({ ...fields, [col]: val }),
                });
              } else if (tableName === 'clientes') {
                await fetch('/api/clientes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                  body: JSON.stringify({ ...fields, [col]: val }),
                });
              } else if (tableName === 'proveedores') {
                await fetch('/api/proveedores', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                  body: JSON.stringify({ ...fields, [col]: val }),
                });
              } else if (tableName === 'compras' && fields.estado) {
                await fetch(`/api/compras/${val}/estado`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                  body: JSON.stringify({ estado: fields.estado }),
                });
              }
            } catch (e) {
              console.warn(`[Update backend error on ${tableName}]:`, e);
            }

            const key = tableName === 'medicamentos' ? 'meds' : tableName === 'proveedores' ? 'provs' : tableName === 'clientes' ? 'clients' : tableName;
            const currentList = getStore<any[]>(key, []);
            const updated = currentList.map((item) => {
              if (String(item[col]) === String(val)) {
                return { ...item, ...fields };
              }
              return item;
            });
            setStore(key, updated);
            return { data: updated.filter((item) => String(item[col]) === String(val)), error: null };
          },
        };
      },
      delete: () => {
        return {
          eq: (col: string, val: any) => {
            const executeDelete = async () => {
              try {
                if (tableName === 'medicamentos') {
                  await fetch(`/api/medicamentos/${val}`, { method: 'DELETE', headers: getAuthHeader() });
                } else if (tableName === 'proveedores') {
                  await fetch(`/api/proveedores/${val}`, { method: 'DELETE', headers: getAuthHeader() });
                } else if (tableName === 'users' || tableName === 'profiles') {
                  await fetch(`/api/auth/users/${val}`, { method: 'DELETE', headers: getAuthHeader() });
                }
              } catch (e) {
                console.warn(`[Delete backend error on ${tableName}]:`, e);
              }

              const key = tableName === 'medicamentos' ? 'meds' : tableName === 'proveedores' ? 'provs' : tableName === 'clientes' ? 'clients' : tableName;
              const currentList = getStore<any[]>(key, []);
              const toDelete = currentList.filter((item) => String(item[col]) === String(val));
              const remaining = currentList.filter((item) => String(item[col]) !== String(val));
              setStore(key, remaining);
              return { data: toDelete, error: null };
            };

            return {
              select: executeDelete,
              then: (resolve: any, reject?: any) => executeDelete().then(resolve, reject),
            };
          },
        };
      },
      then: (resolve: any, reject?: any) => {
        return executeQuery()
          .then((data) => ({ data, error: null }))
          .then(resolve, reject);
      },
    };

    return builder;
  }

  async rpc(funcName: string, args: any) {
    if (funcName === 'registrar_venta') {
      const { _items, _desc_pct, _cliente_id } = args;

      // Calculate totals
      const meds = await this.fetchTableData('medicamentos');
      let subtotal = 0;
      const details: any[] = [];

      for (const item of _items) {
        const m = meds.find((x: any) => x.id === item.med_id);
        if (!m) throw new Error('Producto no existe');
        if (m.stock < item.cantidad) throw new Error(`Stock insuficiente: ${m.nombre}`);
        const precioUnit = Number(m.precio_venta ?? m.precioVenta ?? 0);
        subtotal += precioUnit * item.cantidad;
        details.push({
          medId: m.id,
          nombre: m.nombre,
          cantidad: item.cantidad,
          precio: precioUnit,
        });
      }

      const descuento = Math.round(((subtotal * (_desc_pct || 0)) / 100) * 100) / 100;
      const base = subtotal - descuento;
      const iva = Math.round(base * 0.12 * 100) / 100;
      const total = base + iva;
      const puntos = _cliente_id ? Math.floor(total / 100) * 5 : 0;
      const currentUser = getStore<any | null>('current_user', INITIAL_USERS[0]);
      const displayCode = `VTA-${Date.now().toString().slice(-4)}`;
      const ventaId = `uuid-${Date.now()}`;

      const ventaPayload = {
        ventaData: {
          id: ventaId,
          codigo: displayCode,
          subtotal,
          descuento,
          descPct: _desc_pct || 0,
          iva,
          total,
          vendedorNombre: currentUser?.nombre || 'Usuario',
          vendedorId: currentUser?.id ? String(currentUser.id) : null,
          clienteId: _cliente_id || null,
          puntos,
        },
        items: details,
      };

      try {
        const res = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(ventaPayload),
        });

        if (res.ok) {
          const nuevaVenta = await res.json();
          return {
            data: {
              id: nuevaVenta.id,
              codigo: nuevaVenta.codigo,
              fecha: nuevaVenta.fecha || new Date().toISOString(),
              total: Number(nuevaVenta.total),
              puntos: nuevaVenta.puntos,
              subtotal: Number(nuevaVenta.subtotal),
              descuento: Number(nuevaVenta.descuento),
              iva: Number(nuevaVenta.iva),
              desc_pct: Number(nuevaVenta.descPct ?? nuevaVenta.desc_pct ?? 0),
              vendedor_nombre: nuevaVenta.vendedorNombre || nuevaVenta.vendedor_nombre,
            },
            error: null,
          };
        }
      } catch (err) {
        console.warn('[Sale Backend Error, processing locally]:', err);
      }

      // Local fallback
      const ventas = getStore<any[]>('ventas', []);
      const newVentaLocal = {
        id: ventaId,
        codigo: displayCode,
        fecha: new Date().toISOString(),
        vendedor_id: currentUser?.id || 'usr-admin',
        vendedor_nombre: currentUser?.nombre || 'Usuario',
        cliente_id: _cliente_id,
        subtotal,
        descuento,
        desc_pct: _desc_pct || 0,
        iva,
        total,
        puntos,
        items: details,
        venta_detalle: details.map((d) => ({
          med_id: d.medId,
          nombre: d.nombre,
          cantidad: d.cantidad,
          precio: d.precio,
        })),
      };

      ventas.unshift(newVentaLocal);
      setStore('ventas', ventas);

      return {
        data: {
          id: newVentaLocal.id,
          codigo: newVentaLocal.codigo,
          fecha: newVentaLocal.fecha,
          total: newVentaLocal.total,
          puntos: newVentaLocal.puntos,
          subtotal: newVentaLocal.subtotal,
          descuento: newVentaLocal.descuento,
          iva: newVentaLocal.iva,
          desc_pct: newVentaLocal.desc_pct,
          vendedor_nombre: newVentaLocal.vendedor_nombre,
        },
        error: null,
      };
    }

    if (funcName === 'recibir_compra') {
      const { _id } = args;
      try {
        const res = await fetch(`/api/compras/${_id}/estado`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ estado: 'Completado' }),
        });
        if (res.ok) {
          return { data: null, error: null };
        }
      } catch (err) {
        console.warn('[Recibir Compra Backend Error, processing locally]:', err);
      }

      // Local fallback
      const compras = getStore<any[]>('compras', INITIAL_COMPRAS);
      const meds = getStore<any[]>('meds', INITIAL_MEDS);
      const compra = compras.find((c) => c.id === _id);
      if (compra && compra.estado !== 'Completado') {
        compra.estado = 'Completado';
        const med = meds.find((m) => m.id === compra.med_id);
        if (med) {
          med.stock += compra.cantidad;
          med.precio_compra = compra.costo;
        }
        setStore('compras', compras);
        setStore('meds', meds);
      }
      return { data: null, error: null };
    }

    return { data: null, error: new Error(`RPC function ${funcName} not supported`) };
  }
}

let _supabaseClient: any = null;

if (hasRealSupabase) {
  _supabaseClient = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
  );
} else {
  _supabaseClient = new CloudSQLDatabaseClient();
}

export const supabase = _supabaseClient;
