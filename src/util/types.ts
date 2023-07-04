import { VectorDB, VectorStorageDB } from "./vectordb";
import { useStore } from "../state/store";


export interface MessageMetadata {
  sender: string;
}

export interface Message extends MessageMetadata {
  content: string;
}

export interface Chat {
  title: string;
  messages: Message[];
}

export abstract class LLM {
  abstract name: string;
  abstract chatCompletionStream(chat: Chat): Promise<ReadableStream<Uint8Array>>;
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