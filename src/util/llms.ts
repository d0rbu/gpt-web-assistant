import browser, { Runtime } from "webextension-polyfill";
import { Chat, Message, LLM, WebsiteMetadata } from '../util/types';
import { OpenAI } from 'openai-streams';
import { useStore } from '../state/store';
import { VectorStorageDB, VectorDB } from "../util/vectordb";
import { GPTPrompt, Prompt } from './prompts';
import { IVSSimilaritySearchItem } from 'vector-storage';


const CONTEXT_K: number = 5;

const prompt: Prompt = new GPTPrompt();

export class GPT extends LLM {
    name: string = 'ChatGPT';
    searchPort: Runtime.Port;
    chatCompletionStream: (chat: Chat) => Promise<ReadableStream<Uint8Array>> = async (chat) => {
        const { key } = useStore.getState();
        const lastMessage = chat.messages[chat.messages.length - 1];
        console.log(`Searching for documents similar to ${lastMessage.content}`);
        // const context: IVSSimilaritySearchItem<WebsiteMetadata>[] = [];
        // message service worker to perform search using browser runtime
        const port: Runtime.Port = browser.runtime.connect({ name: "search" });
        port.postMessage({
            query: lastMessage.content,
            k: CONTEXT_K,
        });
        const context: IVSSimilaritySearchItem<WebsiteMetadata>[] = await new Promise((resolve, reject) => {
            port.onMessage.addListener((results: IVSSimilaritySearchItem<WebsiteMetadata>[]) => {
                resolve(results);
            });
        });
        console.log(`Found ${context.length} similar documents:`);
        console.log(context.map((item) => item.metadata.title));

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

    constructor() {
        super();
        
        this.searchPort = browser.runtime.connect({ name: "search" });
    }
};

const LLMS = {
    GPT,
}

export default LLMS;
