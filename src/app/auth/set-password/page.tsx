import React from 'react';
import SetPasswordClient from './SetPasswordClient';

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : '';
  return <SetPasswordClient token={token} />;
}
