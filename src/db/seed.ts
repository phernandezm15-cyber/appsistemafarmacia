import { db } from './index.ts';
import {
  medicamentos,
  clientes,
  proveedores,
  users,
  compras,
  ventas,
  ventaItems,
} from './schema.ts';
import { sql } from 'drizzle-orm';

export const INITIAL_MEDS = [
  { id: 'MED-001', codigo: '75010000010', nombre: 'Panadol Extra', principio: 'Paracetamol 500mg', categoria: 'Analgésicos', caducidad: new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10), precioCompra: '8.50', precioVenta: '14.00', stock: 120 },
  { id: 'MED-002', codigo: '75010079191', nombre: 'Advil', principio: 'Ibuprofeno 400mg', categoria: 'Antiinflamatorios', caducidad: new Date(Date.now() + 300 * 86400000).toISOString().slice(0, 10), precioCompra: '12.00', precioVenta: '19.50', stock: 85 },
  { id: 'MED-003', codigo: '75010158382', nombre: 'Amoxil', principio: 'Amoxicilina 500mg', categoria: 'Antibióticos', caducidad: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10), precioCompra: '35.00', precioVenta: '55.00', stock: 6 },
  { id: 'MED-004', codigo: '75010237573', nombre: 'Clarityne', principio: 'Loratadina 10mg', categoria: 'Antihistamínicos', caducidad: new Date(Date.now() + 250 * 86400000).toISOString().slice(0, 10), precioCompra: '22.00', precioVenta: '34.00', stock: 48 },
  { id: 'MED-005', codigo: '75010316764', nombre: 'Omeprazol MK', principio: 'Omeprazol 20mg', categoria: 'Gastrointestinal', caducidad: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10), precioCompra: '15.00', precioVenta: '25.00', stock: 64 },
  { id: 'MED-006', codigo: '75010395955', nombre: 'Losartán Denk', principio: 'Losartán 50mg', categoria: 'Cardiovascular', caducidad: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10), precioCompra: '28.00', precioVenta: '42.00', stock: 8 },
  { id: 'MED-007', codigo: '75010475146', nombre: 'Centrum', principio: 'Multivitamínico', categoria: 'Vitaminas', caducidad: new Date(Date.now() + 500 * 86400000).toISOString().slice(0, 10), precioCompra: '95.00', precioVenta: '139.00', stock: 30 },
  { id: 'MED-008', codigo: '75010554337', nombre: 'Ventolin', principio: 'Salbutamol 100mcg', categoria: 'Respiratorio', caducidad: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10), precioCompra: '48.00', precioVenta: '72.00', stock: 22 },
  { id: 'MED-009', codigo: '75010633528', nombre: 'Aspirina Bayer', principio: 'Ácido acetilsalicílico', categoria: 'Analgésicos', caducidad: new Date(Date.now() + 600 * 86400000).toISOString().slice(0, 10), precioCompra: '6.00', precioVenta: '10.00', stock: 150 },
  { id: 'MED-010', codigo: '75010712719', nombre: 'Cipro', principio: 'Ciprofloxacino 500mg', categoria: 'Antibióticos', caducidad: new Date(Date.now() + 210 * 86400000).toISOString().slice(0, 10), precioCompra: '40.00', precioVenta: '62.00', stock: 5 },
  { id: 'MED-011', codigo: '75010791900', nombre: 'Voltaren', principio: 'Diclofenaco 50mg', categoria: 'Antiinflamatorios', caducidad: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10), precioCompra: '18.00', precioVenta: '29.00', stock: 40 },
  { id: 'MED-012', codigo: '75010871091', nombre: 'Allegra', principio: 'Fexofenadina 180mg', categoria: 'Antihistamínicos', caducidad: new Date(Date.now() + 320 * 86400000).toISOString().slice(0, 10), precioCompra: '45.00', precioVenta: '68.00', stock: 26 },
  { id: 'MED-013', codigo: '75010950282', nombre: 'Gaviscon', principio: 'Alginato de sodio', categoria: 'Gastrointestinal', caducidad: new Date(Date.now() + 140 * 86400000).toISOString().slice(0, 10), precioCompra: '38.00', precioVenta: '58.00', stock: 18 },
  { id: 'MED-014', codigo: '75011029473', nombre: 'Redoxon', principio: 'Vitamina C 1g', categoria: 'Vitaminas', caducidad: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10), precioCompra: '30.00', precioVenta: '46.00', stock: 55 },
  { id: 'MED-015', codigo: '75011108664', nombre: 'Atorvastatina MK', principio: 'Atorvastatina 20mg', categoria: 'Cardiovascular', caducidad: new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10), precioCompra: '32.00', precioVenta: '50.00', stock: 9 },
  { id: 'MED-016', codigo: '75011187855', nombre: 'Bepanthen', principio: 'Dexpantenol 5%', categoria: 'Dermatológicos', caducidad: new Date(Date.now() + 420 * 86400000).toISOString().slice(0, 10), precioCompra: '42.00', precioVenta: '65.00', stock: 35 },
  { id: 'MED-017', codigo: '75011267046', nombre: 'Glucophage', principio: 'Metformina 850mg', categoria: 'Diabetes', caducidad: new Date(Date.now() + 380 * 86400000).toISOString().slice(0, 10), precioCompra: '26.00', precioVenta: '40.00', stock: 70 },
  { id: 'MED-018', codigo: '75011346237', nombre: 'Mucosolvan', principio: 'Ambroxol 30mg', categoria: 'Respiratorio', caducidad: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10), precioCompra: '33.00', precioVenta: '49.00', stock: 14 },
  { id: 'MED-019', codigo: '75011425428', nombre: 'Fucidin', principio: 'Ácido fusídico 2%', categoria: 'Dermatológicos', caducidad: new Date(Date.now() + 260 * 86400000).toISOString().slice(0, 10), precioCompra: '55.00', precioVenta: '82.00', stock: 3 },
  { id: 'MED-020', codigo: '75011504619', nombre: 'Januvia', principio: 'Sitagliptina 100mg', categoria: 'Diabetes', caducidad: new Date(Date.now() + 500 * 86400000).toISOString().slice(0, 10), precioCompra: '210.00', precioVenta: '295.00', stock: 12 },
];

export const INITIAL_PROVS = [
  { id: 'PRV-001', empresa: 'Droguería Centroamericana', contacto: 'Luis Méndez', telefono: '2245-1100', correo: 'ventas@drocen.gt', direccion: 'Zona 9, Ciudad de Guatemala' },
  { id: 'PRV-002', empresa: 'Laboratorios Bonin', contacto: 'Ana Castillo', telefono: '2380-4422', correo: 'pedidos@bonin.gt', direccion: 'Zona 12, Ciudad de Guatemala' },
  { id: 'PRV-003', empresa: 'Farmasa Distribuciones', contacto: 'Carlos Rivera', telefono: '2421-7788', correo: 'info@farmasa.com', direccion: 'Mixco, Guatemala' },
  { id: 'PRV-004', empresa: 'MediPharma GT', contacto: 'Sofía Herrera', telefono: '2290-3355', correo: 'contacto@medipharma.gt', direccion: 'Zona 10, Ciudad de Guatemala' },
  { id: 'PRV-005', empresa: 'Grupo Selecta Salud', contacto: 'Jorge Pérez', telefono: '7765-0099', correo: 'selecta@salud.gt', direccion: 'Quetzaltenango' },
];

export const INITIAL_CLIENTS = [
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

export const INITIAL_USERS = [
  { email: 'admin@farmacia.gt', password: 'admin123', nombre: 'Admin General', role: 'admin' },
  { email: 'empleado@farmacia.gt', password: 'empleado123', nombre: 'María López', role: 'empleado' },
];

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Verificar si existen medicamentos
    const medsCount = await db.select({ count: sql<number>`count(*)::int` }).from(medicamentos);
    if ((medsCount[0]?.count ?? 0) === 0) {
      console.log('[Seed] Sembrando catálogo de medicamentos...');
      await db.insert(medicamentos).values(INITIAL_MEDS).onConflictDoNothing();
    }

    // 2. Verificar si existen proveedores
    const provsCount = await db.select({ count: sql<number>`count(*)::int` }).from(proveedores);
    if ((provsCount[0]?.count ?? 0) === 0) {
      console.log('[Seed] Sembrando proveedores...');
      await db.insert(proveedores).values(INITIAL_PROVS).onConflictDoNothing();
    }

    // 3. Verificar si existen clientes
    const clientsCount = await db.select({ count: sql<number>`count(*)::int` }).from(clientes);
    if ((clientsCount[0]?.count ?? 0) === 0) {
      console.log('[Seed] Sembrando clientes...');
      await db.insert(clientes).values(INITIAL_CLIENTS).onConflictDoNothing();
    }

    // 4. Verificar usuarios
    const usersCount = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    if ((usersCount[0]?.count ?? 0) === 0) {
      console.log('[Seed] Sembrando usuarios admin y empleado...');
      await db.insert(users).values(INITIAL_USERS).onConflictDoNothing();
    }

    // 5. Verificar compras iniciales
    const comprasCount = await db.select({ count: sql<number>`count(*)::int` }).from(compras);
    if ((comprasCount[0]?.count ?? 0) === 0) {
      console.log('[Seed] Sembrando compras iniciales...');
      await db.insert(compras).values([
        { id: 'CMP-001', codigo: 'CMP-001', fecha: new Date(Date.now() - 1 * 86400000), proveedorId: 'PRV-001', medId: 'MED-003', cantidad: 50, costo: '35.00', estado: 'Pendiente', nota: 'Entrega programada' },
        { id: 'CMP-002', codigo: 'CMP-002', fecha: new Date(Date.now() - 3 * 86400000), proveedorId: 'PRV-002', medId: 'MED-001', cantidad: 100, costo: '8.50', estado: 'Completado', nota: null },
        { id: 'CMP-003', codigo: 'CMP-003', fecha: new Date(Date.now() - 6 * 86400000), proveedorId: 'PRV-004', medId: 'MED-007', cantidad: 20, costo: '95.00', estado: 'Completado', nota: null },
        { id: 'CMP-004', codigo: 'CMP-004', fecha: new Date(Date.now() - 8 * 86400000), proveedorId: 'PRV-003', medId: 'MED-010', cantidad: 40, costo: '40.00', estado: 'Pendiente', nota: null },
        { id: 'CMP-005', codigo: 'CMP-005', fecha: new Date(Date.now() - 12 * 86400000), proveedorId: 'PRV-001', medId: 'MED-009', cantidad: 80, costo: '6.00', estado: 'Completado', nota: null },
        { id: 'CMP-006', codigo: 'CMP-006', fecha: new Date(Date.now() - 15 * 86400000), proveedorId: 'PRV-005', medId: 'MED-017', cantidad: 60, costo: '26.00', estado: 'Completado', nota: null },
      ]).onConflictDoNothing();
    }

    // 6. Verificar ventas iniciales para historial, POS y reportes
    const ventasCount = await db.select({ count: sql<number>`count(*)::int` }).from(ventas);
    if ((ventasCount[0]?.count ?? 0) === 0) {
      console.log('[Seed] Sembrando ventas históricas...');
      const vendedores = ['Admin General', 'María López'];
      const now = Date.now();

      for (let i = 0; i < 24; i++) {
        const dayOffset = (i * 3) % 21;
        const hour = 9 + ((i * 4) % 10);
        const minute = (i * 17) % 60;
        const date = new Date(now - dayOffset * 86400000);
        date.setHours(hour, minute, 0, 0);

        const medIdx = (i * 2) % INITIAL_MEDS.length;
        const med = INITIAL_MEDS[medIdx];
        const qty = 1 + (i % 3);
        const precio = Number(med.precioVenta);
        const subtotal = Math.round(precio * qty * 100) / 100;
        const descPct = i % 5 === 0 ? 5 : 0;
        const descuento = Math.round(((subtotal * descPct) / 100) * 100) / 100;
        const iva = Math.round((subtotal - descuento) * 0.12 * 100) / 100;
        const total = Math.round((subtotal - descuento + iva) * 100) / 100;

        const cliente = i % 3 === 0 ? INITIAL_CLIENTS[i % INITIAL_CLIENTS.length] : null;
        const puntos = cliente ? Math.floor(total / 100) * 5 : 0;
        const ventaId = `uuid-seed-vta-${i + 1}`;
        const codigo = `VTA-${1000 + i + 1}`;

        await db.insert(ventas).values({
          id: ventaId,
          codigo,
          fecha: date,
          subtotal: String(subtotal),
          descuento: String(descuento),
          descPct: String(descPct),
          iva: String(iva),
          total: String(total),
          vendedorNombre: vendedores[i % vendedores.length],
          vendedorId: i % 2 === 0 ? '1' : '2',
          clienteId: cliente ? cliente.id : null,
          puntos,
        }).onConflictDoNothing();

        await db.insert(ventaItems).values({
          ventaId,
          medId: med.id,
          nombre: med.nombre,
          cantidad: qty,
          precio: String(precio),
        }).onConflictDoNothing();
      }
    }

    console.log('[Seed] Verificación y siembra de base de datos completada exitosamente.');
  } catch (error) {
    console.error('[Seed Error] Error al sembrar base de datos inicial:', error);
  }
}
