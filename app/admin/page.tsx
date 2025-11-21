import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Server Action para aprobar/rechazar (inline para simplificar archivo)
async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const action = formData.get('action') as string; // 'approve' or 'reject'
    
    const status = action === 'approve' ? 'aprobado' : 'rechazado';
    const client = await pool.connect();
    
    try {
        await client.query(
            "UPDATE reservas SET estado_reserva = $1, fecha_aprobacion = CASE WHEN $1='aprobado' THEN NOW() ELSE NULL END WHERE id_reserva = $2", 
            [status, id]
        );
        // Si se rechaza, liberar vehículo (si se había marcado ocupado)
        // Aquí es simple lógica de estado.
    } finally {
        client.release();
    }
    revalidatePath('/admin');
}

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: { start?: string, end?: string } }) {
  const client = await pool.connect();
  
  // 1. Pendientes
  const pendientes = await client.query(`
    SELECT r.id_reserva, u.nombre, u.apellido, v.modelo, v.descripcion, r.fecha_inicio, r.total_estimado, r.estado_reserva
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id_usuario
    JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
    WHERE r.estado_reserva = 'pendiente'
    ORDER BY r.fecha_solicitud DESC
  `);

  // 2. Búsqueda por fechas
  let historico: any[] = [];
  if (searchParams.start && searchParams.end) {
     historico = (await client.query(`
        SELECT r.id_reserva, u.nombre, u.apellido, v.descripcion, r.fecha_inicio, r.estado_reserva
        FROM reservas r
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
        WHERE r.fecha_inicio >= $1 AND r.fecha_inicio <= $2
     `, [searchParams.start, searchParams.end])).rows;
  }

  client.release();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-brand-dark mb-8">Panel de Administración</h1>

      {/* SECCIÓN PENDIENTES */}
      <div className="bg-white rounded-lg shadow p-6 mb-12">
        <h2 className="text-xl font-bold mb-4 text-brand-accent">Solicitudes Pendientes ({pendientes.rowCount})</h2>
        {pendientes.rows.length === 0 ? <p>No hay solicitudes pendientes.</p> : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-brand-light">
                        <tr>
                            <th className="p-2">Cliente</th>
                            <th className="p-2">Vehículo</th>
                            <th className="p-2">Fecha Inicio</th>
                            <th className="p-2">Total</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendientes.rows.map((row: any) => (
                            <tr key={row.id_reserva} className="border-b">
                                <td className="p-2">{row.nombre} {row.apellido}</td>
                                <td className="p-2">{row.modelo} - {row.descripcion}</td>
                                <td className="p-2">{new Date(row.fecha_inicio).toLocaleString()}</td>
                                <td className="p-2 font-bold">${row.total_estimado}</td>
                                <td className="p-2 flex gap-2">
                                    <form action={updateStatus}>
                                        <input type="hidden" name="id" value={row.id_reserva} />
                                        <button name="action" value="approve" className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Aprobar</button>
                                    </form>
                                    <form action={updateStatus}>
                                        <input type="hidden" name="id" value={row.id_reserva} />
                                        <button name="action" value="reject" className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Rechazar</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* SECCIÓN HISTÓRICO */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-brand-dark">Reservas por Rango</h2>
        <form className="flex gap-4 mb-6">
            <input type="date" name="start" className="border p-2 rounded" required />
            <input type="date" name="end" className="border p-2 rounded" required />
            <button type="submit" className="bg-brand-dark text-white px-4 py-2 rounded">Buscar</button>
        </form>

        {historico.length > 0 && (
            <table className="w-full text-left">
                <thead className="bg-brand-light">
                    <tr>
                        <th className="p-2">Cliente</th>
                        <th className="p-2">Vehículo</th>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2">Contrato</th>
                    </tr>
                </thead>
                <tbody>
                    {historico.map((row: any) => (
                        <tr key={row.id_reserva} className="border-b">
                            <td className="p-2">{row.nombre} {row.apellido}</td>
                            <td className="p-2">{row.descripcion}</td>
                            <td className="p-2">{new Date(row.fecha_inicio).toLocaleDateString()}</td>
                            <td className="p-2 capitalize">{row.estado_reserva}</td>
                            <td className="p-2">
                                <a href={`/contract/${row.id_reserva}`} target="_blank" className="text-brand-accent underline">Ver</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
