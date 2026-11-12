import fs from 'fs';
import path from 'path';
import { db } from './index.ts';
import {
  medicamentos,
  clientes,
  proveedores,
  compras,
  ventas,
  ventaItems,
  users,
} from './schema.ts';
import { eq, desc, sql } from 'drizzle-orm';
import { INITIAL_MEDS, INITIAL_PROVS, INITIAL_CLIENTS } from './seed.ts';

// Persistent storage file paths
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'farmacia_database.json');

// Default initial state
let memMeds: any[] = INITIAL_MEDS.map(m => ({
  ...m,
  precio_compra: Number(m.precioCompra),
  precio_venta: Number(m.precioVenta),
}));
let memProvs: any[] = [...INITIAL_PROVS];
let memClients: any[] = [...INITIAL_CLIENTS];
let memCompras: any[] = [
  {
    id: "uuid-compra-seed-1",
    codigo: "OC-1001",
    fecha: new Date(Date.now() - 5 * 86400000).toISOString(),
    proveedorId: "PRV-001",
    medId: "MED-001",
    cantidad: 50,
    costo: 8.5,
    estado: "Completado",
    nota: "Entrega programada completada",
  },
  {
    id: "uuid-compra-seed-2",
    codigo: "OC-1002",
    fecha: new Date(Date.now() - 2 * 86400000).toISOString(),
    proveedorId: "PRV-002",
    medId: "MED-002",
    cantidad: 30,
    costo: 12.0,
    estado: "Pendiente",
    nota: "Pedido de reposición mensual",
  },
];
let memVentas: any[] = [];
let memUsers: any[] = [
  { id: 1, email: 'admin@farmacia.gt', password: 'admin123', nombre: 'Admin General', role: 'admin' },
  { id: 2, email: 'empleado@farmacia.gt', password: 'empleado123', nombre: 'María López', role: 'empleado' },
];

// Seed sales if empty
for (let i = 0; i < 15; i++) {
  const med = memMeds[i % memMeds.length];
  const qty = 1 + (i % 3);
  const p = Number(med.precioVenta || med.precio_venta || 15);
  const sub = Math.round(p * qty * 100) / 100;
  const tot = Math.round(sub * 1.12 * 100) / 100;
  memVentas.push({
    id: `vta-seed-${i + 1}`,
    codigo: `VTA-${1000 + i + 1}`,
    fecha: new Date(Date.now() - (i * 2 + 1) * 86400000).toISOString(),
    subtotal: sub,
    descuento: 0,
    descPct: 0,
    iva: Math.round(sub * 0.12 * 100) / 100,
    total: tot,
    vendedorNombre: i % 2 === 0 ? "Admin General" : "María López",
    vendedorId: i % 2 === 0 ? "1" : "2",
    clienteId: memClients[i % memClients.length]?.id,
    puntos: Math.floor(tot / 100) * 5,
    items: [
      {
        medId: med.id,
        nombre: med.nombre,
        cantidad: qty,
        precio: p,
      }
    ]
  });
}

// Function to save state to persistent database JSON file
export function savePersistentState() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          version: "1.0",
          updatedAt: new Date().toISOString(),
          meds: memMeds,
          provs: memProvs,
          clients: memClients,
          compras: memCompras,
          ventas: memVentas,
          users: memUsers,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.error('[Database Save Error]:', err);
  }
}

// Function to load state from persistent database JSON file
export function loadPersistentState() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.meds) && data.meds.length > 0) memMeds = data.meds;
      if (Array.isArray(data.provs) && data.provs.length > 0) memProvs = data.provs;
      if (Array.isArray(data.clients) && data.clients.length > 0) memClients = data.clients;
      if (Array.isArray(data.compras)) memCompras = data.compras;
      if (Array.isArray(data.ventas) && data.ventas.length > 0) memVentas = data.ventas;
      if (Array.isArray(data.users) && data.users.length > 0) memUsers = data.users;
      console.log(`[Database Loaded] ${memMeds.length} meds, ${memVentas.length} ventas, ${memClients.length} clients.`);
    } else {
      savePersistentState();
    }
  } catch (err) {
    console.error('[Database Load Error]:', err);
  }
}

// Load on module startup
loadPersistentState();

// ----------------- MEDICAMENTOS -----------------
export async function getMedicamentos() {
  try {
    const list = await db.select().from(medicamentos).orderBy(medicamentos.id);
    if (list && list.length > 0) return list;
  } catch (error) {
    // fallback
  }
  return memMeds;
}

export async function upsertMedicamento(data: any) {
  const id = data.id || `MED-${Date.now().toString().slice(-4)}`;
  const precioCompra = data.precioCompra != null ? String(data.precioCompra) : data.precio_compra != null ? String(data.precio_compra) : '0.00';
  const precioVenta = data.precioVenta != null ? String(data.precioVenta) : data.precio_venta != null ? String(data.precio_venta) : '0.00';

  let result = null;
  try {
    result = await db
      .insert(medicamentos)
      .values({
        id,
        codigo: data.codigo || `750${Date.now().toString().slice(-8)}`,
        nombre: data.nombre,
        principio: data.principio || '',
        categoria: data.categoria || 'General',
        caducidad: data.caducidad || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        precioCompra,
        precioVenta,
        stock: Number(data.stock ?? 0),
      })
      .onConflictDoUpdate({
        target: medicamentos.id,
        set: {
          codigo: data.codigo,
          nombre: data.nombre,
          principio: data.principio,
          categoria: data.categoria,
          caducidad: data.caducidad,
          precioCompra,
          precioVenta,
          stock: Number(data.stock ?? 0),
        },
      })
      .returning();
  } catch (error) {
    // handled below
  }

  const existingIdx = memMeds.findIndex((m) => m.id === id);
  const item = {
    id,
    codigo: data.codigo || `750${Date.now().toString().slice(-8)}`,
    nombre: data.nombre,
    principio: data.principio || '',
    categoria: data.categoria || 'General',
    caducidad: data.caducidad || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    precioCompra,
    precioVenta,
    precio_compra: Number(precioCompra),
    precio_venta: Number(precioVenta),
    stock: Number(data.stock ?? 0),
  };

  if (existingIdx >= 0) {
    memMeds[existingIdx] = item;
  } else {
    memMeds.push(item);
  }
  savePersistentState();

  return result || [item];
}

export async function deleteMedicamento(id: string) {
  try {
    await db.delete(medicamentos).where(eq(medicamentos.id, id));
  } catch (error) {
    // fallback
  }
  memMeds = memMeds.filter((m) => m.id !== id);
  savePersistentState();
  return [{ id }];
}

// ----------------- CLIENTES -----------------
export async function getClientes() {
  try {
    const list = await db.select().from(clientes).orderBy(clientes.nombre);
    if (list && list.length > 0) return list;
  } catch (error) {
    // fallback
  }
  return memClients;
}

export async function upsertCliente(data: any) {
  const id = data.id || `CLI-${Date.now().toString().slice(-4)}`;
  let result = null;
  try {
    result = await db
      .insert(clientes)
      .values({
        id,
        nombre: data.nombre,
        telefono: data.telefono || '',
        nit: data.nit || 'CF',
        puntos: Number(data.puntos ?? 0),
      })
      .onConflictDoUpdate({
        target: clientes.id,
        set: {
          nombre: data.nombre,
          telefono: data.telefono || '',
          nit: data.nit || 'CF',
          puntos: Number(data.puntos ?? 0),
        },
      })
      .returning();
  } catch (error) {
    // fallback
  }

  const existingIdx = memClients.findIndex((c) => c.id === id);
  const item = {
    id,
    nombre: data.nombre,
    telefono: data.telefono || '',
    nit: data.nit || 'CF',
    puntos: Number(data.puntos ?? 0),
  };
  if (existingIdx >= 0) {
    memClients[existingIdx] = item;
  } else {
    memClients.push(item);
  }
  savePersistentState();

  return result || [item];
}

// ----------------- PROVEEDORES -----------------
export async function getProveedores() {
  try {
    const list = await db.select().from(proveedores).orderBy(proveedores.empresa);
    if (list && list.length > 0) return list;
  } catch (error) {
    // fallback
  }
  return memProvs;
}

export async function upsertProveedor(data: any) {
  const id = data.id || `PRV-${Date.now().toString().slice(-4)}`;
  const payload = {
    id,
    empresa: data.empresa || '',
    contacto: data.contacto || '',
    telefono: data.telefono || '',
    correo: data.correo || '',
    direccion: data.direccion || '',
  };
  let result = null;
  try {
    result = await db
      .insert(proveedores)
      .values(payload)
      .onConflictDoUpdate({
        target: proveedores.id,
        set: payload,
      })
      .returning();
  } catch (error) {
    // fallback
  }

  const idx = memProvs.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memProvs[idx] = payload;
  } else {
    memProvs.push(payload);
  }
  savePersistentState();

  return result || [payload];
}

export async function deleteProveedor(id: string) {
  try {
    await db.delete(proveedores).where(eq(proveedores.id, id));
  } catch (error) {
    // fallback
  }
  memProvs = memProvs.filter((p) => p.id !== id);
  savePersistentState();
  return [{ id }];
}

// ----------------- COMPRAS -----------------
export async function getCompras() {
  try {
    const list = await db.select().from(compras).orderBy(desc(compras.fecha));
    if (list && list.length > 0) return list;
  } catch (error) {
    // fallback
  }
  return memCompras;
}

export async function createCompra(data: {
  id?: string;
  codigo: string;
  proveedorId: string;
  medId: string;
  cantidad: number;
  costo: number;
  estado: string;
  nota?: string | null;
}) {
  const id = data.id || `uuid-cmp-${Date.now()}`;
  let result = null;
  try {
    const [c] = await db
      .insert(compras)
      .values({
        id,
        codigo: data.codigo,
        fecha: new Date(),
        proveedorId: data.proveedorId,
        medId: data.medId,
        cantidad: data.cantidad,
        costo: String(data.costo),
        estado: data.estado,
        nota: data.nota || null,
      })
      .returning();

    if (data.estado === 'Completado') {
      await db
        .update(medicamentos)
        .set({
          stock: sql`${medicamentos.stock} + ${data.cantidad}`,
          precioCompra: String(data.costo),
        })
        .where(eq(medicamentos.id, data.medId));
    }
    result = c;
  } catch (error) {
    // fallback
  }

  const item = {
    id,
    codigo: data.codigo,
    fecha: new Date().toISOString(),
    proveedorId: data.proveedorId,
    medId: data.medId,
    cantidad: data.cantidad,
    costo: data.costo,
    estado: data.estado,
    nota: data.nota || null,
  };
  memCompras.unshift(item);

  if (data.estado === 'Completado') {
    const med = memMeds.find((m) => m.id === data.medId);
    if (med) {
      med.stock = (med.stock || 0) + data.cantidad;
      med.precio_compra = data.costo;
      med.precioCompra = String(data.costo);
    }
  }
  savePersistentState();

  return result || item;
}

export async function updateCompraEstado(id: string, nuevoEstado: string) {
  try {
    await db.transaction(async (tx) => {
      const [compra] = await tx
        .select()
        .from(compras)
        .where(eq(compras.id, id));

      if (compra) {
        await tx
          .update(compras)
          .set({ estado: nuevoEstado })
          .where(eq(compras.id, id));

        if (nuevoEstado === 'Completado' && compra.estado !== 'Completado' && compra.medId) {
          await tx
            .update(medicamentos)
            .set({
              stock: sql`${medicamentos.stock} + ${compra.cantidad}`,
              precioCompra: String(compra.costo),
            })
            .where(eq(medicamentos.id, compra.medId as string));
        }
      }
    });
  } catch (error) {
    // fallback
  }

  const compra = memCompras.find((c) => c.id === id);
  if (compra) {
    compra.estado = nuevoEstado;
    if (nuevoEstado === 'Completado') {
      const med = memMeds.find((m) => m.id === compra.medId);
      if (med) {
        med.stock = (med.stock || 0) + compra.cantidad;
        med.precio_compra = compra.costo;
      }
    }
    savePersistentState();
    return compra;
  }
  return null;
}

// ----------------- VENTAS (POS) -----------------
export async function getVentas() {
  try {
    const listVentas = await db.select().from(ventas).orderBy(desc(ventas.fecha)).limit(100);
    if (listVentas && listVentas.length > 0) {
      const result = [];
      for (const v of listVentas) {
        const items = await db.select().from(ventaItems).where(eq(ventaItems.ventaId, v.id));
        result.push({
          ...v,
          items,
        });
      }
      return result;
    }
  } catch (error) {
    // fallback
  }
  return memVentas;
}

export async function createVentaTransaccional(
  ventaData: {
    id: string;
    codigo: string;
    subtotal: number;
    descuento: number;
    descPct: number;
    iva: number;
    total: number;
    vendedorNombre: string;
    vendedorId?: string | null;
    clienteId?: string | null;
    puntos: number;
  },
  items: {
    medId: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }[]
) {
  let dbResult = null;
  try {
    dbResult = await db.transaction(async (tx) => {
      const [nuevaVenta] = await tx
        .insert(ventas)
        .values({
          id: ventaData.id,
          codigo: ventaData.codigo,
          subtotal: String(ventaData.subtotal),
          descuento: String(ventaData.descuento),
          descPct: String(ventaData.descPct),
          iva: String(ventaData.iva),
          total: String(ventaData.total),
          vendedorNombre: ventaData.vendedorNombre,
          vendedorId: ventaData.vendedorId ?? null,
          clienteId: ventaData.clienteId ?? null,
          puntos: ventaData.puntos,
        })
        .returning();

      for (const item of items) {
        await tx.insert(ventaItems).values({
          ventaId: nuevaVenta.id,
          medId: item.medId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: String(item.precio),
        });

        await tx
          .update(medicamentos)
          .set({
            stock: sql`GREATEST(0, ${medicamentos.stock} - ${item.cantidad})`,
          })
          .where(eq(medicamentos.id, item.medId));
      }

      if (ventaData.clienteId && ventaData.puntos > 0) {
        await tx
          .update(clientes)
          .set({
            puntos: sql`${clientes.puntos} + ${ventaData.puntos}`,
          })
          .where(eq(clientes.id, ventaData.clienteId));
      }

      return nuevaVenta;
    });
  } catch (error) {
    // handled in fallback below
  }

  // Update in-memory persistent store
  const item = {
    ...ventaData,
    fecha: new Date().toISOString(),
    items: [...items],
  };
  memVentas.unshift(item);

  // Decrement stock in catalog
  for (const line of items) {
    const m = memMeds.find((x) => x.id === line.medId);
    if (m) {
      m.stock = Math.max(0, (m.stock || 0) - line.cantidad);
    }
  }

  // Add points to customer
  if (ventaData.clienteId && ventaData.puntos > 0) {
    const c = memClients.find((x) => x.id === ventaData.clienteId);
    if (c) {
      c.puntos = (c.puntos || 0) + ventaData.puntos;
    }
  }

  savePersistentState();
  return dbResult || item;
}

// ----------------- USUARIOS & AUTH -----------------
export async function getUsers() {
  try {
    const list = await db.select().from(users).orderBy(users.id);
    if (list && list.length > 0) return list.map(({ password: _p, ...u }) => u);
  } catch (error) {
    // fallback
  }
  return memUsers.map(({ password: _p, ...u }) => u);
}

export async function getUserByEmail(email: string) {
  const normEmail = email.toLowerCase().trim();
  try {
    const [u] = await db.select().from(users).where(eq(users.email, normEmail));
    if (u) return u;
  } catch (error) {
    // fallback to memory
  }
  return memUsers.find((u) => u.email.toLowerCase() === normEmail) || null;
}

export async function createUser(data: {
  email: string;
  password: string;
  nombre: string;
  role: string;
}) {
  const normEmail = data.email.toLowerCase().trim();
  let dbResult = null;
  try {
    const [u] = await db
      .insert(users)
      .values({
        email: normEmail,
        password: data.password,
        nombre: data.nombre.trim(),
        role: data.role,
      })
      .returning();
    const { password: _p, ...safeUser } = u;
    dbResult = safeUser;
  } catch (error) {
    // fallback
  }

  const newUser = {
    id: memUsers.length + 1,
    email: normEmail,
    password: data.password,
    nombre: data.nombre.trim(),
    role: data.role,
  };
  memUsers.push(newUser);
  savePersistentState();

  const { password: _p, ...safeUser } = newUser;
  return dbResult || safeUser;
}

export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    // fallback
  }
  memUsers = memUsers.filter((u) => u.id !== id);
  savePersistentState();
  return [{ id }];
}
