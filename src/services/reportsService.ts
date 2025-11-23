import api from '@/lib/apiClient';
import { ReportCreateInput } from '@/types';

export const reportsService = {
  createReport: async (cellId: number, data: ReportCreateInput) => {
    const res = await api.post(`/cells/${cellId}/reports`, data);
    return res.data;
  },
  getRecentPresences: async (cellId: number) => {
    const res = await api.get<{ date: string; members: any[] }[]>(`/cells/${cellId}/reports/presences`);
    return res.data;
  },
};
