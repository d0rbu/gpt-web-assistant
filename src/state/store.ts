import browser, { Runtime } from "webextension-polyfill";
import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { Message, Chat, LLM } from '../util/types';
import LLMS from '../util/llms';

// Define the store
interface KeyStore {
  key: string;
  setKey: (key: string) => void;
  chatIdx: number;
  setChatIdx: (chatIdx: number) => void;
  llm?: LLM;
  setLLM: (llm: LLM) => void;
  chats: Chat[];
  addChat: (chat: Chat) => void;
  removeChat: (chatIdx: number) => void;
  addToChat: (chatIdx: number, message: Message) => void;
  addToLastChatMessageContent: (chatIdx: number, content: string) => void;
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
        llm: undefined,
        setLLM: (llm) => set({ llm }),
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

          // send to background script
          const port: Runtime.Port = browser.runtime.connect({ name: "message" });
          port.postMessage(message);
          
          set({ chats });
        },
        addToLastChatMessageContent: (chatIdx, content) => {
          const chats = [...get().chats];
          chats[chatIdx].messages[chats[chatIdx].messages.length - 1].content += content;
          set({ chats });
        }
      }),
      {
        name: 'key-storage',
        onRehydrateStorage: (state) => {
          console.log("Hydrating state", state);
          return (rehydratedState, error) => {
            console.log("Hydrated state", rehydratedState);
            if (rehydratedState?.key) {
              rehydratedState.setLLM(new LLMS.GPT(rehydratedState.key));
            }
          }
        },
        partialize: (state) => ({ key: state.key, chatIdx: state.chatIdx, chats: state.chats }),
      }
    ),
  ),
);
