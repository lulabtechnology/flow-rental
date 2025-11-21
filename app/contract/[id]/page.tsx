import pool from '@/lib/db';

export default async function ContractPage({ params }: { params: { id: string } }) {
  const client = await pool.connect();
  
  const res = await client.query(`
    SELECT r.*, u.nombre, u.apellido, u.numero_cedula, u.direccion, v.modelo, v.descripcion, v.numero_serie
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id_usuario
    JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
    WHERE r.id_reserva = $1
  `, [params.id]);

  client.release();

  if (res.rows.length === 0) return <div className="p-10">Contrato no encontrado</div>;
  
  const data = res.rows[0];

  return (
    <div className="max-w-3xl mx-auto bg-white p-12 my-10 shadow-lg border border-gray-300 font-serif text-black">
      <div className="text-center mb-8 border-b-2 pb-4 border-black">
        <h1 className="text-2xl font-bold uppercase">Contrato de Alquiler - Flow Rental</h1>
        <p className="text-sm">Bocas del Toro, Panamá</p>
      </div>

      <div className="mb-6">
        <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>Contrato N°:</strong> {data.id_reserva.split('-')[0]}</p>
      </div>

      <div className="mb-6 space-y-2">
        <h3 className="font-bold bg-gray-100 p-2">1. ARRENDATARIO</h3>
        <p>Nombre: {data.nombre} {data.apellido}</p>
        <p>Documento ID: {data.numero_cedula}</p>
        <p>Dirección: {data.direccion}</p>
      </div>

      <div className="mb-6 space-y-2">
        <h3 className="font-bold bg-gray-100 p-2">2. VEHÍCULO</h3>
        <p>Tipo: {data.modelo} - {data.descripcion}</p>
        <p>Serie/Placa: {data.numero_serie || 'N/A'}</p>
      </div>

      <div className="mb-6 space-y-2">
        <h3 className="font-bold bg-gray-100 p-2">3. CONDICIONES</h3>
        <p>Fecha Inicio: {new Date(data.fecha_inicio).toLocaleString()}</p>
        <p>Fecha Fin: {new Date(data.fecha_fin).toLocaleString()}</p>
        <p>Total Estimado: <strong>${data.total_estimado} USD</strong></p>
      </div>

      <div className="text-xs text-justify leading-relaxed mb-12">
        <p className="mb-2">El arrendatario declara recibir el vehículo en perfecto estado de funcionamiento y se compromete a devolverlo en el mismo estado. El arrendatario es responsable de cualquier multa de tránsito, daño al vehículo o robo durante el periodo de alquiler.</p>
        <p>Flow Rental no se hace responsable por accidentes o lesiones sufridas durante el uso del vehículo. El uso de casco es obligatorio según las leyes de tránsito de Panamá.</p>
      </div>

      <div className="flex justify-between mt-20 pt-8 border-t border-black">
        <div className="text-center w-1/3">
            <div className="border-b border-black h-10 mb-2"></div>
            <p>Firma Arrendatario</p>
        </div>
        <div className="text-center w-1/3">
            <div className="border-b border-black h-10 mb-2"></div>
            <p>Firma Flow Rental</p>
        </div>
      </div>
    </div>
  );
}
