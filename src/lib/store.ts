import { create } from 'zustand';
import { Cell, Member, User, PermissionUpsertInput } from '@/types';

interface AppState {
  // Cells (formerly groups)
  cells: Cell[];
  setCells: (cells: Cell[]) => void;

  // Members of the selected cell
  members: Member[];
  setMembers: (members: Member[]) => void;

  // Current selected cell id (null = personal / none)
  currentCellId: number | null;
  setCurrentCellId: (cellId: number | null) => void;

  // Current user (if available)
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Stored permission upserts (useful for batching UI operations)
  pendingPermissions: PermissionUpsertInput[];
  setPendingPermissions: (perms: PermissionUpsertInput[]) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  cells: [],
  setCells: (cells) => set({ cells }),

  members: [],
  setMembers: (members) => set({ members }),

  currentCellId: null,
  setCurrentCellId: (cellId) => set({ currentCellId: cellId }),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  pendingPermissions: [],
  setPendingPermissions: (perms) => set({ pendingPermissions: perms }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
