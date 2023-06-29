import { VectorDB, VectorStorageDB } from "./vectordb";
import { useStore } from "../state/store";
import { Readability } from "@mozilla/readability";


export interface Message {
  content: string;
  timestamp: Date;
  sender: string;
}

export interface Chat {
  title: string;
  messages: Message[];
}

export abstract class LLM {
  abstract name: string;
  abstract chatCompletionStream: (chat: Chat) => Promise<ReadableStream<Uint8Array>>;
  
  db: VectorDB | null = null;

  constructor() {
    useStore.subscribe((state) => state.key, (key) => {
      if (key) {
        this.db = new VectorStorageDB(key);
      } else {
        this.db = null;
      }
    });
  }
}

export interface WebsiteMetadata {
  title: string;
  url: string;
}

export interface WebsiteContent extends WebsiteMetadata {
  text: string;
}

export interface RawWebsiteContent {
  url: string;
  parsed: any;
}