import { Chat, Message, LLM } from '../util/types';
import { OpenAI } from 'openai-streams';
import { useStore } from '../state/store';


export class GPT implements LLM {
    name: string = 'ChatGPT';
    chatCompletionStream: (chat: Chat) => Promise<ReadableStream<Uint8Array>> = (chat) => {
        const { key } = useStore.getState();
        
        return OpenAI(
            "chat",
            {
                model: "gpt-3.5-turbo",
                messages: chat.messages.map((message: Message) => ({
                    content: message.content,
                    role: message.sender,
                })),
            },
            {
                apiKey: key,
            }
        )
    }

    constructor() {
        this.chatCompletionStream = this.chatCompletionStream.bind(this);
    }
};

const LLMS = {
    GPT,
}

export default LLMS;
