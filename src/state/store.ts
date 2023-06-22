import create from 'zustand';

// Define the store
interface MyStore {
  key: string;
  setKey: (key: string) => void;
}

// Create the store
export const useStore = create<MyStore>((set) => ({
  key: '',
  setKey: (key) => set({ key }),
}));
