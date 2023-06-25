import { Chat, Message, LLM } from '../util/types';
import { OpenAI } from 'openai-streams';
import { useStore } from '../state/store';



function GPTStream(chat: Chat) {
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


export const GPT: LLM = {
    name: 'ChatGPT',
    chatCompletionStream: GPTStream,
};


const LLMS: { [key: string]: LLM } = {
    GPT,
}


export default LLMS;
