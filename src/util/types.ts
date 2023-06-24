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
  name: string;  // TODO: figure out this interface
}
