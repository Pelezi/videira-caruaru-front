import api from '@/lib/apiClient';
import { Member } from '@/types';

export const membersService = {
  getMembers: async (cellId: number): Promise<Member[]> => {
    const res = await api.get<Member[]>(`/cells/${cellId}/members`);
    return res.data;
  },

  addMember: async (cellId: number, data: { name: string }): Promise<Member> => {
    const res = await api.post<Member>(`/cells/${cellId}/members`, data);
    return res.data;
  },
  updateMember: async (cellId: number, memberId: number, data: { name: string }): Promise<Member> => {
    const res = await api.put<Member>(`/cells/${cellId}/members/${memberId}`, data);
    return res.data;
  },

  deleteMember: async (cellId: number, memberId: number): Promise<void> => {
    await api.delete(`/cells/${cellId}/members/${memberId}`);
  },
};
