import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Usuarios del sistema con roles (Administrador y Empleado)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  nombre: text('nombre').notNull(),
  role: text('role').notNull().default('empleado'), // 'admin' | 'empleado'
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Catálogo de Medicamentos
export const medicamentos = pgTable('medicamentos', {
  id: text('id').primaryKey(), // 'MED-001'
  codigo: text('codigo').notNull().unique(), // Código de barra
  nombre: text('nombre').notNull(),
  principio: text('principio').notNull(),
  categoria: text('categoria').notNull(),
  caducidad: text('caducidad').notNull(), // YYYY-MM-DD
  precioCompra: numeric('precio_compra', { precision: 10, scale: 2 }).notNull(),
  precioVenta: numeric('precio_venta', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Clientes y Fidelización por Puntos
export const clientes = pgTable('clientes', {
  id: text('id').primaryKey(), // 'CLI-001'
  nombre: text('nombre').notNull(),
  telefono: text('telefono').notNull(),
  nit: text('nit').notNull(),
  puntos: integer('puntos').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Proveedores Farmacéuticos
export const proveedores = pgTable('proveedores', {
  id: text('id').primaryKey(), // 'PRV-001'
  empresa: text('empresa').notNull(),
  contacto: text('contacto').notNull(),
  telefono: text('telefono').notNull(),
  correo: text('correo').notNull(),
  direccion: text('direccion').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Órdenes de Compra y Recepción
export const compras = pgTable('compras', {
  id: text('id').primaryKey(), // 'CMP-001'
  codigo: text('codigo').notNull(),
  fecha: timestamp('fecha').notNull().defaultNow(),
  proveedorId: text('proveedor_id').references(() => proveedores.id),
  medId: text('med_id').references(() => medicamentos.id),
  cantidad: integer('cantidad').notNull(),
  costo: numeric('costo', { precision: 10, scale: 2 }).notNull(),
  estado: text('estado').notNull().default('Pendiente'), // 'Completado' | 'Pendiente'
  nota: text('nota'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Ventas y Facturas en POS
export const ventas = pgTable('ventas', {
  id: text('id').primaryKey(), // UUID string
  codigo: text('codigo').notNull(), // 'VTA-1001'
  fecha: timestamp('fecha').notNull().defaultNow(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  descuento: numeric('descuento', { precision: 10, scale: 2 }).notNull().default('0'),
  descPct: numeric('desc_pct', { precision: 5, scale: 2 }).notNull().default('0'),
  iva: numeric('iva', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  vendedorNombre: text('vendedor_nombre').notNull(),
  vendedorId: text('vendedor_id'),
  clienteId: text('cliente_id').references(() => clientes.id),
  puntos: integer('puntos').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Detalle de Ítems Vendidos
export const ventaItems = pgTable('venta_items', {
  id: serial('id').primaryKey(),
  ventaId: text('venta_id').references(() => ventas.id, { onDelete: 'cascade' }).notNull(),
  medId: text('med_id').references(() => medicamentos.id).notNull(),
  nombre: text('nombre').notNull(),
  cantidad: integer('cantidad').notNull(),
  precio: numeric('precio', { precision: 10, scale: 2 }).notNull(),
});

// Relaciones Drizzle
export const ventasRelations = relations(ventas, ({ many, one }) => ({
  items: many(ventaItems),
  cliente: one(clientes, {
    fields: [ventas.clienteId],
    references: [clientes.id],
  }),
}));

export const ventaItemsRelations = relations(ventaItems, ({ one }) => ({
  venta: one(ventas, {
    fields: [ventaItems.ventaId],
    references: [ventas.id],
  }),
  medicamento: one(medicamentos, {
    fields: [ventaItems.medId],
    references: [medicamentos.id],
  }),
}));

export const comprasRelations = relations(compras, ({ one }) => ({
  proveedor: one(proveedores, {
    fields: [compras.proveedorId],
    references: [proveedores.id],
  }),
  medicamento: one(medicamentos, {
    fields: [compras.medId],
    references: [medicamentos.id],
  }),
}));
