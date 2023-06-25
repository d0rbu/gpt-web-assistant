export interface Message {
  content: string;
  timestamp: Date;
  sender: string;
}

export interface Chat {
  title: string;
  messages: Message[];
}

export interface LLM {
  name: string;
  chatCompletionStream: (chat: Chat) => Promise<ReadableStream<Uint8Array>>;
}

export interface WebsiteMetadata {
  title: string;
  url: string;
}

export interface WebsiteContent extends WebsiteMetadata {
  text: string;
}
