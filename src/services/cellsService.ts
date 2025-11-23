import api from '@/lib/apiClient';
import { Cell } from '@/types';

export const cellsService = {
  getCells: async (): Promise<Cell[]> => {
    const res = await api.get<Cell[]>('/cells');
    return res.data;
  },

  getCell: async (id: number): Promise<Cell> => {
    const res = await api.get<Cell>(`/cells/${id}`);
    return res.data;
  },

  createCell: async (data: { name: string; leaderUserId?: number; discipuladoId?: number }): Promise<Cell> => {
    const res = await api.post<Cell>('/cells', data);
    return res.data;
  },

  updateCell: async (id: number, data: { name?: string; leaderUserId?: number }): Promise<Cell> => {
    const res = await api.put<Cell>(`/cells/${id}`, data);
    return res.data;
  },

  deleteCell: async (id: number): Promise<void> => {
    await api.delete(`/cells/${id}`);
  },

  multiplyCell: async (
    id: number,
    data: {
      memberIds: number[];
      newCellName: string;
      newLeaderUserId?: number;
      oldLeaderUserId?: number;
    }
  ): Promise<void> => {
    await api.post(`/cells/${id}/multiply`, data);
  },
};
