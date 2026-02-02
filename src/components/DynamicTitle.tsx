'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DynamicTitle() {
  const { currentMatrix } = useAuth();

  useEffect(() => {
    if (currentMatrix?.name) {
      document.title = currentMatrix.name;
    } else {
      document.title = 'Portal Uvas';
    }
  }, [currentMatrix]);

  return null;
}
