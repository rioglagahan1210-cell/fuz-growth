"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-base";
import { Sun, Ruler, Cpu, Activity, Download, LayoutDashboard } from "lucide-react";

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function FuzGrowthDashboard() {
  const [dataSensor, setDataSensor] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data dari Supabase
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15);

    if (!error) {
      setDataSensor(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel("perubahan-data")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sensor_data" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const terbaru = dataSensor[0];

  // 2. Fungsi Download CSV
  const downloadCSV = () => {
    const headers = ["Waktu,Cahaya(Lux),Jarak(cm),Servo(deg)\n"];
    const rows = dataSensor.map(item => {
      const waktu = new Date(item.created_at).toLocaleString("id-ID");
      return `${waktu},${item.lux},${item.jarak},${item.servo}\n`;
    });
    const csvContent = headers.concat(rows).join("");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "log_fuz_growth.csv";
    a.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="animate-bounce text-emerald-600 font-bold">MEMUAT DATA...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-200">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">FUZ-GROWTH</h1>
            <p className="text-xs font-bold text-emerald-500 tracking-widest uppercase">IoT Research Project</p>
          </div>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" /> DOWNLOAD CSV
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD CAHAYA (Lux) */}
        <div className="md:col-span-2 bg-white/70 backdrop-blur-md p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Sun className={`w-5 h-5 ${terbaru?.lux > 2000 ? 'animate-spin-slow text-yellow-500' : ''}`} />
                <span className="text-xs font-black uppercase tracking-widest">Intensitas Cahaya</span>
              </div>
              <p className="text-6xl font-black text-slate-800">{terbaru?.lux} <span className="text-xl font-light text-slate-400">lx</span></p>
            </div>
            <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter ${terbaru?.lux > 2000 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {terbaru?.lux > 2000 ? 'Terik' : 'Normal'}
            </div>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full mt-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-yellow-400 h-full transition-all duration-1000" 
              style={{ width: `${Math.min((terbaru?.lux / 4000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* CARD JARAK & SERVO */}
        <div className="space-y-6">
          {/* Card Jarak */}
          <div className={`p-6 rounded-[2rem] shadow-lg transition-all border ${terbaru?.jarak < 20 ? 'bg-red-50 border-red-100' : 'bg-white border-white'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Ruler className={`w-4 h-4 ${terbaru?.jarak < 20 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jarak Objek</span>
            </div>
            <p className={`text-4xl font-black ${terbaru?.jarak < 20 ? 'text-red-600' : 'text-slate-800'}`}>
              {terbaru?.jarak} <span className="text-sm font-normal">cm</span>
            </p>
          </div>

          {/* Card Servo */}
          <div className="bg-slate-800 p-6 rounded-[2rem] shadow-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Posisi Servo</span>
            </div>
            <p className="text-4xl font-black text-white">
              {terbaru?.servo}<span className="text-sm font-normal text-emerald-400 font-serif">°</span>
            </p>
          </div>
        </div>

        {/* STATUS RELAY (LOGIC ESP32 SIMULATION) */}
        <div className="md:col-span-3 bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-sm tracking-widest uppercase">Status Kontrol Relay (Fuz-Logic)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 1, on: terbaru?.lux < 2000 },
              { id: 2, on: terbaru?.lux < 1000 || (terbaru?.lux > 2000 && terbaru?.lux <= 3000) },
              { id: 3, on: terbaru?.lux < 2000 },
            ].map((r) => (
              <div key={r.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                r.on ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-50 bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${r.on ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className={`font-bold text-sm ${r.on ? 'text-emerald-700' : 'text-slate-400'}`}>Relay 0{r.id}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${r.on ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {r.on ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TABLE LOGSHEET */}
        <div className="md:col-span-3 bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Logsheet Data Terakhir</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Cahaya</th>
                  <th className="px-6 py-4">Jarak</th>
                  <th className="px-6 py-4">Servo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dataSensor.map((item, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-600">{new Date(item.created_at).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{item.lux} lx</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{item.jarak} cm</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{item.servo}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        &copy; 2026 Risetnesia - Fuz-Growth Project
      </footer>
    </div>
  );
}