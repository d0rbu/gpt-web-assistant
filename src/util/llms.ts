import browser, { Runtime } from "webextension-polyfill";
import { Chat, Message, LLM, WebsiteMetadata } from '../util/types';
import { OpenAI } from 'openai-streams';
import { useStore } from '../state/store';
import { VectorStorageDB, VectorDB } from "../util/vectordb";
import { GPTPrompt, Prompt } from './prompts';
import { IVSSimilaritySearchItem } from 'vector-storage';
import { yieldStream } from "yield-stream";
import { Configuration, OpenAIApi } from "openai";


const CONTEXT_K: number = 5;
const prompt: Prompt = new GPTPrompt();

export class GPT extends LLM {
    name: string = 'ChatGPT';
    searchPort: Runtime.Port;
    chatCompletionStream: (chat: Chat) => Promise<ReadableStream<Uint8Array>> = async (chat) => {
        const { key } = useStore.getState();

        if (this.unsubscribe === null) {
            this.unsubscribe = useStore.subscribe((state) => state.key, (key, prevKey) => {
                console.log(key);
                if (key) {
                    console.log("NEW KEY!", key);
                    const configuration = new Configuration({
                        apiKey: key
                    });
                    this.openai = new OpenAIApi(configuration);
                }
            });

            if (this.openai === null && key) {
                const configuration = new Configuration({
                    apiKey: key
                });
                this.openai = new OpenAIApi(configuration);
            }
        }
        
        const lastMessage: string = chat.messages[chat.messages.length - 1].content;
        const condenseQuestionPrompt: string = prompt.getCondenseQuestionPrompt(chat);
        let condensedQuestion: string | null = null;
        if (this.openai !== null) {
            const condensedQuestionCompletion = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo-0613",
                messages: [
                    { role: "user", content: condenseQuestionPrompt },
                ],
                functions: [
                    {
                        name: "answerDirectly",
                        description: "Indicate the question can be answered directly without external context",
                        parameters: {
                            type: "object",
                            properties: {},
                        },
                    }
                ],
                function_call: "auto",
            })
            const condensedQuestionResponse = condensedQuestionCompletion.data.choices[0].message;
            if (condensedQuestionResponse?.content && !condensedQuestionResponse.content.includes("answerDirectly")) {  // if it replied with a condensed question
                condensedQuestion = condensedQuestionResponse.content;
            } else {
                console.log("No condensed question response");
            }
        } else {
            console.log("No OpenAI key set for question condensing");
        }

        let lastMessageWithContext = lastMessage;
        // const condensedQuestion = lastMessage;
        if (condensedQuestion) {
            console.log(`Searching for documents similar to ${condensedQuestion}`);
            // const context: IVSSimilaritySearchItem<WebsiteMetadata>[] = [];
            // message service worker to perform search using browser runtime
            const port: Runtime.Port = browser.runtime.connect({ name: "search" });
    
            port.postMessage({
                query: condensedQuestion,
                k: CONTEXT_K,
            });
            const context: IVSSimilaritySearchItem<WebsiteMetadata>[] = await new Promise((resolve, reject) => {
                port.onMessage.addListener((results: IVSSimilaritySearchItem<WebsiteMetadata>[]) => {
                    resolve(results);
                });
            });
            console.log(`Found ${context.length} similar documents:`);
            console.log(context.map((item) => item.metadata.title));
    
            lastMessageWithContext = prompt.getTaskPrompt(context, lastMessage);
        }

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
                model: "gpt-3.5-turbo-0613",
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
    openai: OpenAIApi | null;
    unsubscribe: (() => void) | null = null;

    constructor(key?: string) {
        super();
        
        this.searchPort = browser.runtime.connect({ name: "search" });
        this.chatCompletionStream = this.chatCompletionStream.bind(this);

        if (key) {
            const configuration = new Configuration({
                apiKey: key
            });
            this.openai = new OpenAIApi(configuration);
        } else {
            this.openai = null;
        }
    }
};

const LLMS = {
    GPT,
}

export default LLMS;
