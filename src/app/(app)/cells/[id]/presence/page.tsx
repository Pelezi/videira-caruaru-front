"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reportsService } from '@/services/reportsService';
import { cellsService } from '@/services/cellsService';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CellPresencePage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id;
  const cellId = idParam ? Number(idParam) : NaN;

  const [loading, setLoading] = useState(false);
  const [presences, setPresences] = useState<Array<{ date: string; members: any[] }>>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [cellName, setCellName] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(cellId)) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await reportsService.getRecentPresences(cellId);
        setPresences(data || []);
        try {
          const c = await cellsService.getCell(cellId);
          setCellName(c?.name || null);
        } catch (err) {
          // ignore cell name failure, keep null
        }
        // default collapsed
        const map: Record<string, boolean> = {};
        (data || []).forEach((d: any) => { map[d.date] = false; });
        setExpanded(map);
      } catch (e) {
        console.error(e);
        toast.error('Falha ao carregar presenças');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cellId]);

  const toggle = (date: string) => {
    setExpanded((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  if (Number.isNaN(cellId)) {
    return (
      <div className="p-6">
        <div className="mb-4">ID da célula inválido.</div>
        <Link href="/cells" className="text-blue-600">Voltar às células</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Célula {cellName ?? cellId}</h2>
        <div className="flex items-center gap-2">
            <Link href="/cells" className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Voltar</Link>
        </div>
      </div>

      {loading && <div>Carregando...</div>}

      {!loading && presences.length === 0 && (
        <div className="text-sm text-gray-500">Nenhum registro de presença encontrado.</div>
      )}

      <div className="space-y-3">
        {presences.map((p) => {
          const isOpen = !!expanded[p.date];
          return (
            <div key={p.date} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={() => toggle(p.date)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="font-medium">{new Date(p.date).toLocaleDateString('pt-BR')}</div>
                <div className="text-sm text-gray-500">{p.members?.length ?? 0} presente(s)</div>
              </button>

              {isOpen && (
                <div className="p-3 border-t bg-gray-50 dark:bg-gray-900">
                  <ul className="list-disc pl-5 space-y-1">
                    {(p.members || []).map((m: any) => (
                      <li key={m.id} className="text-sm text-gray-900 dark:text-gray-100">{m.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
