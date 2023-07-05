import browser, { Runtime } from "webextension-polyfill";
import { Chat, Message, LLM, WebsiteMetadata, MessageMetadata } from '../util/types';
import { OpenAI } from 'openai-streams';
import { useStore } from '../state/store';
import { VectorStorageDB, VectorDB } from "../util/vectordb";
import { GPTPrompt, Prompt } from './prompts';
import { IVSSimilaritySearchItem } from 'vector-storage';
import { yieldStream } from "yield-stream";
import { Configuration, OpenAIApi } from "openai";


const WEBSITE_CONTEXT_K: number = 8;  // external document context
const MESSAGE_CONTEXT_K: number = 4;  // message history context
const PAST_MESSAGES_K: number = 4;  // how many past messages to keep
const prompt: Prompt = new GPTPrompt();

export class GPT extends LLM {
    name: string = 'ChatGPT';
    searchWebsitesPort: Runtime.Port;
    searchMessagesPort: Runtime.Port;
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
        const condenseQuestionPrompt: string = prompt.getCondenseQuestionPrompt(chat, PAST_MESSAGES_K);
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
        if (condensedQuestion) {
            console.log(`Searching for documents similar to ${condensedQuestion}`);
    
            this.searchWebsitesPort.postMessage({
                query: condensedQuestion,
                k: WEBSITE_CONTEXT_K,
            });
            const websiteContext: IVSSimilaritySearchItem<WebsiteMetadata>[] = await new Promise((resolve, reject) => {
                const listener = (results: IVSSimilaritySearchItem<WebsiteMetadata>[]) => {
                    this.searchWebsitesPort.onMessage.removeListener(listener);
                    resolve(results);
                };
            
                this.searchWebsitesPort.onMessage.addListener(listener);
            });
            console.log(`Found ${websiteContext.length} similar documents for websites:`);
            console.log(websiteContext.map((item) => item.metadata.title));
            
            this.searchMessagesPort.postMessage({
                query: condensedQuestion,
                k: MESSAGE_CONTEXT_K,
            });
            const messageContext: IVSSimilaritySearchItem<MessageMetadata>[] = await new Promise((resolve, reject) => {
                const listener = (results: IVSSimilaritySearchItem<MessageMetadata>[]) => {
                    this.searchMessagesPort.onMessage.removeListener(listener);
                    resolve(results);
                };
            
                this.searchMessagesPort.onMessage.addListener(listener);
            });
            console.log(`Found ${websiteContext.length} similar documents for websites:`);
            console.log(websiteContext.map((item) => item.metadata.title));
    
            lastMessageWithContext = prompt.getTaskPrompt(websiteContext, messageContext, lastMessage);
        }

        const chatToSend = JSON.parse(JSON.stringify(chat));
        chatToSend.messages = chatToSend.messages.slice(chatToSend.messages.length - PAST_MESSAGES_K - 1, chatToSend.messages.length - 1);
        chatToSend.messages.unshift({
            content: prompt.getSystemPrompt(),
            sender: 'system',
            timestamp: new Date(),
        });
        chatToSend.messages[chatToSend.messages.length - 1].content = lastMessageWithContext;

        console.log(chatToSend);
        
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
        
        this.searchWebsitesPort = browser.runtime.connect({ name: "searchSites" });
        this.searchMessagesPort = browser.runtime.connect({ name: "searchMessages" });
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
