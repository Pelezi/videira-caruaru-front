import apiClient from '@/lib/apiClient';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  firstAccess: boolean;
  timezone?: string;
  createdAt: string;
}

export const userService = {
  async register(data: { email: string; firstName: string; lastName: string; password: string }): Promise<User> {
    const response = await apiClient.post('/users/register', data);
    return response.data;
  },

  async updateProfile(data: { timezone?: string; phoneNumber?: string }): Promise<User> {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/users/me');
    return response.data;
  }

  ,

  async getById(id: number) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },


  async list(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async invite(data: { email: string; firstName?: string; lastName?: string; discipuladoId?: number }) {
    const response = await apiClient.post('/users/invite', data);
    return response.data;
  },

  async update(userId: number, data: { firstName?: string; lastName?: string; phoneNumber?: string; timezone?: string }) {
    const response = await apiClient.patch(`/users/${userId}`, data);
    return response.data;
  },

  async remove(userId: number) {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }
};
