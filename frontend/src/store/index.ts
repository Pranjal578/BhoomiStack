import { create } from 'zustand';
import type { Parcel, User } from '../types';

// --- Parcel Store ---
interface ParcelStore {
  activeUlpin: string | null;
  activeParcel: Parcel | null;
  setActiveUlpin: (ulpin: string | null) => void;
  setActiveParcel: (p: Parcel | null) => void;
}

export const useParcelStore = create<ParcelStore>((set) => ({
  activeUlpin: null,
  activeParcel: null,
  setActiveUlpin: (ulpin) => set({ activeUlpin: ulpin }),
  setActiveParcel: (p) => set({ activeParcel: p }),
}));

// --- Auth Store ---
interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem('bhoomi_user') || 'null'); } catch { return null; }
  })(),
  token: localStorage.getItem('bhoomi_token'),
  setAuth: (user, token) => {
    localStorage.setItem('bhoomi_token', token);
    localStorage.setItem('bhoomi_user', JSON.stringify(user));
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('bhoomi_token');
    localStorage.removeItem('bhoomi_user');
    set({ user: null, token: null });
  },
}));

// --- UI Store ---
interface UiStore {
  panelOpen: boolean;
  activeTab: string;
  toasts: Array<{ id: string; message: string; type: string }>;
  setPanelOpen: (v: boolean) => void;
  setActiveTab: (tab: string) => void;
  addToast: (message: string, type?: string) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  panelOpen: false,
  activeTab: 'overview',
  toasts: [],
  setPanelOpen: (v) => set({ panelOpen: v }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
