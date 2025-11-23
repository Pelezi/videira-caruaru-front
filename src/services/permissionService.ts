import api from '@/lib/apiClient';

export const permissionService = {
  upsertPermission: async (data: {
    email: string;
    cellIds: Array<string | number>;
    hasGlobalCellAccess: boolean;
    canManageCells: boolean;
    canManagePermissions: boolean;
  }) => {
    const response = await api.post('/permissions', data);
    return response.data;
  },
};
