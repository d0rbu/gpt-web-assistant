import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';

// Define the store
interface KeyStore {
  key: string;
  setKey: (key: string) => void;
  chatIdx: number;
  setChatIdx: (chatIdx: number) => void;
  chats: Chat[];
  addChat: (chat: Chat) => void;
  removeChat: (chatIdx: number) => void;
  addToChat: (chatIdx: number, message: Message) => void;
}

export interface Message {
  content: string;
  timestamp: Date;
  sender: string;
}

export interface Chat {
  title: string;
  messages: Message[];
}

// Create the store
export const useStore = create<KeyStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        key: '',
        setKey: (key) => set({ key }),
        chatIdx: 0,
        setChatIdx: (chatIdx) => set({ chatIdx }),
        chats: [],
        addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
        removeChat: (chatIdx) => {
          const chats = [...get().chats];
          chats.splice(chatIdx, 1);
          set({ chats });
        },
        addToChat: (chatIdx, message) => {
          const chats = [...get().chats];
          chats[chatIdx].messages.push(message);
          set({ chats });
        },
      }),
      {
        name: 'key-storage',
      }
    ),
  ),
);
