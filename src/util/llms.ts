import { Chat, Message, LLM, WebsiteMetadata } from '../util/types';
import { OpenAI } from 'openai-streams';
import { useStore } from '../state/store';
import { VectorStorageDB, VectorDB } from "../util/vectordb";
import { GPTPrompt, Prompt } from './prompts';
import { IVSSimilaritySearchItem } from 'vector-storage';


const CONTEXT_K: number = 10;

const prompt: Prompt = new GPTPrompt();

export class GPT extends LLM {
    name: string = 'ChatGPT';
    chatCompletionStream: (chat: Chat) => Promise<ReadableStream<Uint8Array>> = async (chat) => {
        const { key } = useStore.getState();
        const lastMessage = chat.messages[chat.messages.length - 1];
        const context: IVSSimilaritySearchItem<WebsiteMetadata>[] = this.db ? await this.db.search(lastMessage.content, CONTEXT_K) : [];

        const lastMessageWithContext = prompt.getTaskPrompt(context, lastMessage.content);

        const chatToSend = JSON.parse(JSON.stringify(chat));
        chatToSend.messages.unshift({
            content: prompt.getSystemPrompt(),
            sender: 'system',
            timestamp: new Date(),
        });
        chatToSend.messages[chatToSend.messages.length - 1].content = lastMessageWithContext;

        console.log(lastMessageWithContext);
        
        return OpenAI(
            "chat",
            {
                model: "gpt-3.5-turbo",
                messages: chatToSend.messages.map((message: Message) => ({
                    content: message.content,
                    role: message.sender,
                })),
            },
            {
                apiKey: key,
            }
        )
    }
};

const LLMS = {
    GPT,
}

export default LLMS;
