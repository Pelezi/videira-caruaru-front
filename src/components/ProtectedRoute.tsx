'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, currentMatrix, requireMatrixSelection } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Check if user is not authenticated
      if (!isAuthenticated && !pathname.includes('/auth/')) {
        router.push('/auth/login');
        return;
      }

      // If authenticated but no matrix selected (and not in matrix selection flow)
      if (isAuthenticated && !currentMatrix && !pathname.includes('/auth/select-matrix')) {
        // If requires matrix selection, redirect to select-matrix
        if (requireMatrixSelection) {
          router.push('/auth/select-matrix');
        } else {
          // Otherwise redirect to login to get matrix info
          router.push('/auth/login');
        }
      }
    }
  }, [isAuthenticated, isLoading, currentMatrix, requireMatrixSelection, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated && !pathname.includes('/auth/')) {
    return null;
  }

  // Allow access to auth pages without matrix
  if (pathname.includes('/auth/')) {
    return <>{children}</>;
  }

  // For protected routes, require both authentication and matrix
  if (!isAuthenticated || !currentMatrix) {
    return null;
  }

  return <>{children}</>;
}
