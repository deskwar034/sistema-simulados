"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearState, loadState } from "@/lib/examStorage";

export default function HomePage() {
  const [hasProgress, setHasProgress] = useState(false);
  useEffect(() => { setHasProgress(Boolean(loadState())); }, []);
  return <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white"><div className="mx-auto max-w-5xl px-4 py-16"><section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-4xl font-bold tracking-tight text-slate-900">Simulado OAB 46</h1><p className="mt-3 text-slate-600">Treine com experiência moderna, focada e com cronômetro inteligente.</p><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["80 questões","20 disciplinas","estilo FGV","cronômetro de 5h"].map((item)=><div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium">{item}</div>)}</div><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/simulado" className="rounded-xl bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700">Iniciar simulado</Link>{hasProgress ? <Link href="/simulado" className="rounded-xl bg-emerald-600 px-4 py-2 text-white transition-all hover:bg-emerald-700">Continuar simulado</Link> : null}{hasProgress ? <button onClick={() => { clearState(); setHasProgress(false); }} className="rounded-xl bg-rose-600 px-4 py-2 text-white transition-all hover:bg-rose-700">Reiniciar simulado</button> : null}</div></section></div></main>;
}
