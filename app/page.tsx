'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, CreditCard, Banknote } from 'lucide-react';

type VehicleOption = {
  id: string;
  label: string;
  talla: string;
  desc: string;
  img: string;
};

const vehicles: VehicleOption[] = [
  { id: 'scooter', label: 'Scooter', talla: '150cc', desc: 'Ideal parejas', img: '/images/vehiculos/scooter-150.jpg' },
  { id: 'navi', label: 'Honda Navi', talla: '100cc', desc: 'Ágil y cool', img: '/images/vehiculos/navi.jpg' },
  { id: 'ebike-l', label: 'Ebike Grande', talla: '26"', desc: 'Aventura eco', img: '/images/vehiculos/ebike-l.jpg' },
  { id: 'ebike-s', label: 'Ebike Pequeña', talla: '20"', desc: 'Compacta', img: '/images/vehiculos/ebike-s.jpg' },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', telefono: '', direccion: '', cedula: '', foto_licencia: '',
    vehiculo: '', 
    tipo_alquiler: 'DIA_8_6',
    fecha_recogida: '', hora_recogida: '09:00',
    metodo_pago: 'efectivo_local' // Default
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `¡Solicitud creada! ID: ${data.id_reserva}. Pasa por el local para completar el pago.` });
        setFormData(prev => ({...prev, nombre: '', apellido: '', email: '', cedula: '', vehiculo: ''}));
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al procesar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO */}
      <section className="relative h-[60vh] flex items-center justify-center bg-brand-dark text-white">
        <div className="absolute inset-0 z-0 opacity-60">
           <img src="/images/hero-bocas.jpg" alt="Bocas" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center p-4">
          <h1 className="text-5xl font-bold mb-4 text-brand-paper drop-shadow-lg">Flow Rental</h1>
          <p className="text-xl mb-8">Explora Bocas con estilo.</p>
          <a href="#reservar" className="btn-primary inline-block">Reservar Ahora</a>
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="reservar" className="py-16 container mx-auto px-4 max-w-3xl">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-brand-brown/20">
          <h2 className="text-3xl font-bold text-brand-dark mb-6 text-center">Reserva tu Vehículo</h2>
          
          {message && (
             <div className={`p-4 mb-6 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                {message.text}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Vehículo */}
            <div>
              <label className="block font-bold text-brand-dark mb-3">1. Elige Vehículo</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicles.map((v) => (
                  <div key={v.id} onClick={() => setFormData({...formData, vehiculo: v.id})}
                    className={`card-select text-center ${formData.vehiculo === v.id ? 'selected' : ''}`}>
                    <div className="font-bold text-sm">{v.label}</div>
                    <div className="text-xs text-gray-500">{v.talla}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Datos Personales */}
            <div className="grid md:grid-cols-2 gap-4">
              <input name="nombre" placeholder="Nombre" required className="input-field" onChange={handleChange} value={formData.nombre} />
              <input name="apellido" placeholder="Apellido" required className="input-field" onChange={handleChange} value={formData.apellido} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               <input name="email" type="email" placeholder="Email" required className="input-field" onChange={handleChange} value={formData.email} />
               <input name="telefono" placeholder="WhatsApp" required className="input-field" onChange={handleChange} value={formData.telefono} />
            </div>
            <input name="cedula" placeholder="ID / Pasaporte" required className="input-field" onChange={handleChange} value={formData.cedula} />

            {/* 3. Fechas */}
            <div className="grid md:grid-cols-3 gap-4 bg-brand-light p-4 rounded border border-brand-brown/10">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold mb-1">Tipo</label>
                    <select name="tipo_alquiler" className="w-full p-2 border rounded" onChange={handleChange} value={formData.tipo_alquiler}>
                        <option value="DIA_8_6">Full Day ($30)</option>
                        <option value="24H">24 Horas ($40)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1">Fecha Recogida</label>
                    <input type="date" name="fecha_recogida" required className="w-full p-2 border rounded" onChange={handleChange} value={formData.fecha_recogida} />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1">Hora</label>
                    <input type="time" name="hora_recogida" required className="w-full p-2 border rounded" onChange={handleChange} value={formData.hora_recogida} />
                </div>
            </div>

            {/* 4. Método de Pago (EL ESPACIO NUEVO) */}
            <div>
                <label className="block font-bold text-brand-dark mb-3">4. Método de Pago</label>
                <div className="grid grid-cols-2 gap-4">
                    <div 
                        onClick={() => setFormData({...formData, metodo_pago: 'efectivo_local'})}
                        className={`border-2 rounded p-4 cursor-pointer flex flex-col items-center gap-2 ${formData.metodo_pago === 'efectivo_local' ? 'border-brand-accent bg-orange-50' : 'border-gray-200'}`}
                    >
                        <Banknote size={24} />
                        <span className="text-sm font-bold">Pagar en Local</span>
                    </div>
                    <div 
                         className="border-2 border-gray-100 text-gray-400 rounded p-4 flex flex-col items-center gap-2 cursor-not-allowed"
                         title="Próximamente"
                    >
                        <CreditCard size={24} />
                        <span className="text-sm font-bold">Tarjeta (Pronto)</span>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary mt-4 disabled:opacity-50">
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
