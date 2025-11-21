import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { 
      nombre, apellido, email, telefono, direccion, cedula, 
      foto_licencia, vehiculo, tipo_alquiler, fecha_recogida, hora_recogida,
      metodo_pago 
    } = body;

    if (!vehiculo || !email || !cedula || !fecha_recogida) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Usuario (Upsert simple)
    // Verifica si existe usuario por email
    let userId;
    const userCheck = await client.query('SELECT id_usuario FROM usuarios WHERE email = $1', [email]);
    
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id_usuario;
      await client.query(
        'UPDATE usuarios SET nombre=$1, apellido=$2, telefono=$3, numero_cedula=$4 WHERE id_usuario=$5',
        [nombre, apellido, telefono, cedula, userId]
      );
    } else {
      const newUser = await client.query(
        'INSERT INTO usuarios (nombre, apellido, email, telefono, direccion, numero_cedula, foto_licencia) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario',
        [nombre, apellido, email, telefono, direccion, cedula, foto_licencia]
      );
      userId = newUser.rows[0].id_usuario;
    }

    // 2. Datos de Tarifa
    const tipoRes = await client.query('SELECT * FROM tipos_alquiler WHERE codigo = $1', [tipo_alquiler]);
    const tipoData = tipoRes.rows[0];
    const precioEstimado = parseFloat(tipoData.precio_base);

    // 3. Buscar Vehículo
    // Mapeo frontend -> DB
    let descFilter = '', tallaFilter = '';
    if (vehiculo === 'scooter') { descFilter = 'Scooter'; tallaFilter = '150cc'; }
    else if (vehiculo === 'navi') { descFilter = 'Honda Navi'; tallaFilter = '100cc'; }
    else if (vehiculo === 'ebike-l') { descFilter = 'Ebike Grande'; tallaFilter = '26"'; }
    else if (vehiculo === 'ebike-s') { descFilter = 'Ebike Pequeña'; tallaFilter = '20"'; }

    // Busca 1 vehiculo disponible y BLOQUÉALO (FOR UPDATE)
    const vehiculoDisp = await client.query(
      `SELECT id_vehiculo FROM vehiculos 
       WHERE descripcion = $1 AND talla = $2 AND estado = 'disponible' 
       LIMIT 1 FOR UPDATE`,
      [descFilter, tallaFilter]
    );

    if (vehiculoDisp.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'No hay disponibilidad para este modelo.' }, { status: 409 });
    }
    const idVehiculo = vehiculoDisp.rows[0].id_vehiculo;

    // 4. Calcular fechas
    const fechaInicio = new Date(`${fecha_recogida}T${hora_recogida}`);
    let fechaFin = new Date(fechaInicio);
    if (tipo_alquiler === 'DIA_8_6') fechaFin.setHours(18, 30, 0);
    else fechaFin.setTime(fechaFin.getTime() + (24 * 60 * 60 * 1000));

    // 5. Crear Reserva
    // Estado inicial: pendiente_pago (aunque paguen en local, técnicamente no han pagado aún)
    const reservaRes = await client.query(
      `INSERT INTO reservas (id_usuario, id_vehiculo, id_tipo_alquiler, fecha_inicio, fecha_fin, total_estimado, estado_reserva)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente_pago') RETURNING id_reserva`,
      [userId, idVehiculo, tipoData.id_tipo_alquiler, fechaInicio, fechaFin, precioEstimado]
    );
    const idReserva = reservaRes.rows[0].id_reserva;

    // 6. Crear Registro de Pago (ESPACIO RESERVADO)
    await client.query(
        `INSERT INTO pagos (id_reserva, monto, metodo_pago, estado_pago)
         VALUES ($1, $2, $3, 'pendiente')`,
        [idReserva, precioEstimado, metodo_pago]
    );

    // Opcional: Marcar vehículo ocupado temporalmente
    // await client.query("UPDATE vehiculos SET estado = 'alquilada' WHERE id_vehiculo = $1", [idVehiculo]);

    await client.query('COMMIT');
    return NextResponse.json({ success: true, id_reserva: idReserva });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
