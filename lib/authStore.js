import { create } from 'zustand';
import { auth } from './firebase';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  initializeAuth: () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },
}));

export default useAuthStore;