export interface User {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  firstAccess?: boolean;
  timezone?: string;
  permission?: Permission | null;
}

export interface Permission {
  id: number;
  hasGlobalCellAccess: boolean;
  canManageCells: boolean;
  canManagePermissions: boolean;
  cellIds: number[] | null;
}

export interface AuthResponse {
  token: string;
  user: User;
  permission?: Permission | null;
}


export interface Cell {
  id: number;
  name: string;
  leaderUserId?: number;
  // optional embedded leader user object when returned by API
  leader?: User | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id: number;
  cellId: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportCreateInput {
  memberIds: number[];
}

export interface PermissionUpsertInput {
  email: string;
  cellIds: string[];
  hasGlobalCellAccess: boolean;
  canManageCells: boolean;
  canManagePermissions: boolean;
}
