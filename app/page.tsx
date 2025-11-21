'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Definición de tipos para el formulario
type VehicleOption = {
  id: string;
  label: string;
  desc: string;
  img: string;
};

const vehicles: VehicleOption[] = [
  { id: 'scooter', label: 'Scooter 150cc', desc: 'Perfecta para parejas', img: '/images/vehiculos/scooter-150.jpg' },
  { id: 'navi', label: 'Honda Navi 100cc', desc: 'Ágil y divertida', img: '/images/vehiculos/navi.jpg' },
  { id: 'ebike-l', label: 'Ebike Grande 26"', desc: 'Aventura ecológica', img: '/images/vehiculos/ebike-l.jpg' },
  { id: 'ebike-s', label: 'Ebike Pequeña 20"', desc: 'Compacta y veloz', img: '/images/vehiculos/ebike-s.jpg' },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    foto_licencia: '',
    vehiculo: '', // scooter, navi, ebike-l, ebike-s
    tipo_alquiler: 'DIA_8_6', // DIA_8_6 o 24H
    fecha_recogida: '',
    hora_recogida: '09:00'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const selectVehicle = (id: string) => {
    setFormData({...formData, vehiculo: id});
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
        setMessage({ type: 'success', text: `¡Reserva recibida! ID: ${data.id_reserva}. Te contactaremos pronto.` });
        // Resetear form
        setFormData(prev => ({...prev, nombre: '', apellido: '', email: '', cedula: '', vehiculo: ''}));
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al procesar la reserva.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-center bg-brand-dark text-white overflow-hidden">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 z-0 opacity-60">
            {/* Usando una imagen de placeholder si no existe la real */}
           <img src="/images/hero-bocas.jpg" alt="Bocas del Toro" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center p-4 max-w-2xl">
          <h1 className="text-5xl font-bold mb-4 text-brand-paper drop-shadow-lg">Descubre Bocas sobre Ruedas</h1>
          <p className="text-xl mb-8 drop-shadow-md">Alquiler premium de Motos y Ebikes. La mejor forma de explorar la isla.</p>
          <a href="#reservar" className="btn-primary inline-block">Reservar Ahora</a>
        </div>
      </section>

      {/* FLOTA */}
      <section id="flota" className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-wider">Nuestra Flota</h2>
          <div className="w-20 h-1 bg-brand-accent mx-auto mt-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {vehicles.map(v => (
            <div key={v.id} className="bg-brand-light p-4 shadow-lg rounded-lg border border-brand-brown/10">
              <div className="h-40 bg-gray-200 rounded-md mb-4 overflow-hidden relative">
                 <img src={v.img} alt={v.label} className="object-cover w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">{v.label}</h3>
              <p className="text-brand-brown">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TARIFAS */}
      <section id="tarifas" className="py-16 bg-brand-dark/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-brand-dark text-center mb-8 uppercase">Tarifas Simples</h2>
          <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-brand-light p-8 rounded-lg shadow border-t-4 border-brand-accent text-center">
                <h3 className="text-2xl font-bold mb-2">Full Day</h3>
                <p className="text-sm text-gray-500 mb-4">8:00 AM – 6:30 PM</p>
                <p className="text-4xl font-bold text-brand-accent">$30.00 <span className="text-base text-gray-500">/día</span></p>
             </div>
             <div className="bg-brand-light p-8 rounded-lg shadow border-t-4 border-brand-brown text-center">
                <h3 className="text-2xl font-bold mb-2">24 Horas</h3>
                <p className="text-sm text-gray-500 mb-4">Devolución al día siguiente</p>
                <p className="text-4xl font-bold text-brand-accent">$40.00 <span className="text-base text-gray-500">/24h</span></p>
             </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="reservar" className="py-16 container mx-auto px-4 max-w-3xl">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-brand-brown/20">
          <h2 className="text-3xl font-bold text-brand-dark mb-6 text-center">Solicitud de Reserva</h2>
          
          {message && (
             <div className={`p-4 mb-6 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                {message.text}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Selección de Vehículo Visual */}
            <div>
              <label className="block font-bold text-brand-dark mb-3">Elige tu vehículo:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicles.map((v) => (
                  <div 
                    key={v.id} 
                    onClick={() => selectVehicle(v.id)}
                    className={`card-select text-center ${formData.vehiculo === v.id ? 'selected' : ''}`}
                  >
                    <div className="text-xs font-bold mb-1">{v.label}</div>
                    <div className="text-[10px] text-gray-500">{v.talla}</div>
                  </div>
                ))}
              </div>
              <input type="hidden" name="vehiculo" value={formData.vehiculo} required />
            </div>

            {/* Datos Personales */}
            <div className="grid md:grid-cols-2 gap-4">
              <input name="nombre" placeholder="Nombre" required className="input-field" onChange={handleChange} value={formData.nombre} />
              <input name="apellido" placeholder="Apellido" required className="input-field" onChange={handleChange} value={formData.apellido} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
               <input name="email" type="email" placeholder="Email" required className="input-field" onChange={handleChange} value={formData.email} />
               <input name="telefono" placeholder="Teléfono / WhatsApp" required className="input-field" onChange={handleChange} value={formData.telefono} />
            </div>

            <input name="direccion" placeholder="Dirección / Alojamiento en Bocas" className="input-field" onChange={handleChange} value={formData.direccion} />
            
            <div className="grid md:grid-cols-2 gap-4">
               <input name="cedula" placeholder="Cédula o Pasaporte" required className="input-field" onChange={handleChange} value={formData.cedula} />
               <input name="foto_licencia" placeholder="URL Foto Licencia (Temporal)" className="input-field" onChange={handleChange} value={formData.foto_licencia} />
            </div>

            {/* Datos Reserva */}
            <div className="border-t border-brand-brown/10 pt-4 mt-4">
                <label className="block font-bold text-brand-dark mb-2">Detalles del alquiler:</label>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <select name="tipo_alquiler" className="input-field" onChange={handleChange} value={formData.tipo_alquiler}>
                            <option value="DIA_8_6">Full Day ($30)</option>
                            <option value="24H">24 Horas ($40)</option>
                        </select>
                    </div>
                    <div>
                        <input type="date" name="fecha_recogida" required className="input-field" onChange={handleChange} value={formData.fecha_recogida} />
                    </div>
                    <div>
                        <input type="time" name="hora_recogida" required className="input-field" onChange={handleChange} value={formData.hora_recogida} />
                    </div>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary mt-8 disabled:opacity-50">
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>

          </form>
        </div>
      </section>
    </div>
  );
}
