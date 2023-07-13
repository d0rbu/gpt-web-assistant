import { VectorDB, VectorStorageDB } from "./vectordb";
import { useStore } from "../state/store";


export interface MessageMetadata {
  sender: string;
  chatId: string;
  website: boolean;
}

export interface Message extends MessageMetadata {
  content: string;
}

export interface Chat {
  title: string;
  messages: Message[];
  id: string;
  numEmbedded: number;
}

export abstract class LLM {
  abstract name: string;
  abstract chatCompletionStream(chat: Chat): Promise<ReadableStream<Uint8Array>>;
  abstract titleChat(chat: Chat): Promise<string>;
}

export interface WebsiteMetadata {
  title: string;
  url: string;
  website: boolean;
}

export interface WebsiteContent extends WebsiteMetadata {
  text: string;
}

export interface RawWebsiteContent {
  url: string;
  parsed: any;
}