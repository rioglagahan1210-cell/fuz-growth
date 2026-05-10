"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function FuzGrowthDashboard() {
  const [dataSensor, setDataSensor] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestData = async () => {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15); // Ambil 15 data terbaru untuk grafik & tabel

    if (!error) {
      setDataSensor(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-emerald-600 font-bold">
      Menghubungkan ke Sistem Fuz-Growth...
    </div>
  );

  const terbaru = dataSensor[0]; // Data terbaru (index 0 karena di-order descending)
  const dataGrafik = [...dataSensor].reverse(); // Data dibalik khusus untuk grafik (kiri ke kanan)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10">
      {/* HEADER SECTION */}
      <nav className="bg-white border-b border-emerald-100 p-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-emerald-600 tracking-tighter">FUZ-GROWTH</h1>
            <p className="text-blue-500 text-xs font-bold tracking-widest uppercase">Smart Growth Monitoring System</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dikembangkan Oleh:</p>
            <p className="text-sm font-semibold text-slate-700 uppercase">Muhammad Kenzie Fukayna Irtsanes</p>
            <p className="text-sm font-semibold text-slate-700 uppercase">Ibrahim Utsman Avicenna</p>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* CARD SECTION (DATA TERKINI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-emerald-500">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">CAHAYA</span>
            <p className="text-5xl font-black mt-4 text-slate-800">{terbaru?.lux} <span className="text-lg font-light text-slate-400">lx</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold">JARAK</span>
            <p className="text-5xl font-black mt-4 text-slate-800">{terbaru?.jarak} <span className="text-lg font-light text-slate-400">cm</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-slate-300">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold">SERVO</span>
            <p className="text-5xl font-black mt-4 text-slate-800">{terbaru?.servo}<span className="text-lg font-light text-slate-400">°</span></p>
          </div>
        </div>

        {/* GRAFIK SECTION (DIPISAH) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grafik Cahaya */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-4 uppercase text-xs tracking-widest">Tren Intensitas Cahaya</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafik}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="id" hide />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="stepAfter" dataKey="lux" stroke="#10b981" strokeWidth={3} dot={false} name="Lux" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafik Jarak */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-blue-600 mb-4 uppercase text-xs tracking-widest">Tren Jarak Sensor</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafik}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="id" hide />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="jarak" stroke="#3b82f6" strokeWidth={3} dot={false} name="Jarak (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* LOGSHEET SECTION (TABEL) */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-emerald-600 p-4">
            <h3 className="text-white font-bold text-sm tracking-widest uppercase">Logsheet Data Terkirim</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="p-4 border-b">Waktu Terkirim</th>
                  <th className="p-4 border-b">Cahaya (Lux)</th>
                  <th className="p-4 border-b">Jarak (cm)</th>
                  <th className="p-4 border-b">Servo (°)</th>
                </tr>
              </thead>
              <tbody>
                {dataSensor.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500">
                      {new Date(item.created_at).toLocaleTimeString("id-ID")}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">{item.lux}</td>
                    <td className="p-4 font-bold text-blue-600">{item.jarak}</td>
                    <td className="p-4 font-bold text-slate-700">{item.servo}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="text-center mt-10 opacity-50 text-[10px] font-bold uppercase tracking-[0.2em]">
        © 2026 Fuz-Growth Project • Risetnesia
      </footer>
    </div>
  );
}