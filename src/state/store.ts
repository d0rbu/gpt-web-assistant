import browser, { Runtime } from "webextension-polyfill";
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import LLMS from '../util/llms';
import { Chat, LLM, Message } from '../util/types';


// number of messages to be sent in a chat before creating a title
const NUM_MESSAGES_FOR_TITLE: number = 3;

let processingTitle: boolean = false;


// Define the store
interface KeyStore {
  key: string;
  setKey: (key: string) => void;
  chatIdx: number;
  setChatIdx: (chatIdx: number) => void;
  llm?: LLM;
  setLLM: (llm: LLM) => void;
  filteringMode: string;
  setFilteringMode: (filteringMode: string) => void;
  chats: Chat[];
  addChat: (chat: Chat) => void;
  removeChat: (chatIdx: number) => void;
  addToChat: (chatIdx: number, message: Message) => void;
  setTitle: (chatIdx: number, title: string) => void;
  embedMessage: (chatIdx: number, message: Message) => void;
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
        filteringMode: 'blocklist',
        setFilteringMode: (filteringMode) => {
          // send to background script
          const port: Runtime.Port = browser.runtime.connect({ name: "filteringMode" });
          port.postMessage(filteringMode);
          set({ filteringMode })
        },
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
        setTitle: (chatIdx, title) => {
          const chats = [...get().chats];
          chats[chatIdx].title = title;
          
          set({ chats });
        },
        embedMessage: (chatIdx, message) => {
          // send to background script
          const port: Runtime.Port = browser.runtime.connect({ name: "message" });
          const { chats, llm } = get();

          if (message && chatIdx >= 0 && chatIdx < chats.length) {
            port.postMessage(message);
          }

          const newNumEmbedded = chats[chatIdx].numEmbedded + 1;

          if (!processingTitle && chats[chatIdx].title === '' && chats[chatIdx].messages.length >= NUM_MESSAGES_FOR_TITLE && llm) {
            processingTitle = true;
            llm.titleChat(chats[chatIdx]).then((title) => {
              chats[chatIdx].title = title;
              chats[chatIdx].numEmbedded = newNumEmbedded;
              processingTitle = false;

              set({ chats });
            });
          }
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
