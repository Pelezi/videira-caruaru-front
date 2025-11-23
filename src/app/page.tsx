'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  // Chama a rota /health usando a URL da API do .env
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
  fetch(`${apiBaseUrl.replace(/\/$/, '')}/health`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao conectar ao servidor');
        return res.ok;
      })
      .then(() => {
        setLoading(false);
        const isAuthenticated = authService.isAuthenticated();
        if (!isAuthenticated) {
          router.push('/auth/login');
        }
      })
      .catch(() => {
        setLoading(false);
        setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
      });
  }, [router]);

  // Avoid performing navigation during render — do it in an effect instead
  useEffect(() => {
    if (!loading && !error && authService.isAuthenticated()) {
      router.push('/report');
    }
  }, [loading, error, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}
      {!loading && error && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-600 dark:text-red-400 mt-4">{error}</div>
        </div>
      )}

    </div>
  );
}
