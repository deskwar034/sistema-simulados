"use client";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ApprovalMilestoneModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="mb-2 text-3xl">🎉</p>
        <h2 className="text-2xl font-bold text-slate-900">Parabéns!</h2>
        <p className="mt-3 whitespace-pre-line text-slate-700">
          Parabéns! Você atingiu 40 acertos.{"\n"}
          Com essa nota, você já conseguiria a aprovação na OAB.{"\n"}
          Isso mostra o resultado do seu esforço e dedicação. Continue firme!
        </p>
        <button
          onClick={onClose}
          className="mt-6 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Continuar simulado
        </button>
      </div>
    </div>
  );
}
