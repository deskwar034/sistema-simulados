"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearState, loadState } from "@/lib/examStorage";

export default function HomePage() {
  const [hasProgress, setHasProgress] = useState(false);
  useEffect(() => { setHasProgress(Boolean(loadState())); }, []);
  return <main className="mx-auto max-w-3xl p-6"><h1 className="text-3xl font-bold">Simulado OAB 46</h1><p className="mt-2 text-slate-600">Simulado com 80 questões.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/simulado" className="rounded bg-blue-600 px-4 py-2 text-white">Iniciar simulado</Link>{hasProgress && <Link href="/simulado" className="rounded bg-emerald-600 px-4 py-2 text-white">Continuar simulado</Link>}{hasProgress && <button onClick={()=>{clearState();setHasProgress(false);}} className="rounded bg-red-600 px-4 py-2 text-white">Reiniciar simulado</button>}</div></main>;
}
