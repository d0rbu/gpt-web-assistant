import { IVSDocument, IVSSimilaritySearchItem } from "vector-storage";
import { WebsiteMetadata, MessageMetadata } from "./types";
import { Chat, Message } from "./types";


const WEBSITE_CONTEXT_STRING = '{{WEBSITE_CONTEXT}}';
const MESSAGE_CONTEXT_STRING = '{{MESSAGE_CONTEXT}}';
const TASK_STRING = '{{TASK}}';
const DATETIME_STRING = '{{TIME}}';


export abstract class Prompt {
    protected abstract systemPrompt: string;
    protected abstract taskPrompt: string;
    protected abstract condenseQuestionPrompt: string;

    public getTaskPrompt(websiteContext: IVSSimilaritySearchItem<WebsiteMetadata>[], messageContext: IVSSimilaritySearchItem<MessageMetadata>[],  task: string): string {
        let websiteTextContext: string = ""

        for (const item of websiteContext) {
            websiteTextContext += `${item.metadata.title}\n`
            const datetime = new Date(item.timestamp);
            websiteTextContext += `${datetime.toLocaleString()}\n`;
            websiteTextContext += `${item.metadata.url}\n`;
            websiteTextContext += `Score: ${item.score}\n\n`;
            websiteTextContext += `${item.text}\n\n`;
        }

        let messageTextContext: string = ""

        for (const item of messageContext) {
            const datetime = new Date(item.timestamp);
            messageTextContext += `${datetime.toLocaleString()} ${item.metadata.sender}:\n`;
            messageTextContext += `${item.text}\n\n`;
        }

        return this.taskPrompt.replace(WEBSITE_CONTEXT_STRING, websiteTextContext).replace(MESSAGE_CONTEXT_STRING, messageTextContext).replace(TASK_STRING, task).replace(DATETIME_STRING, new Date().toLocaleString());
    }

    public getSystemPrompt(): string {
        return this.systemPrompt;
    }

    // lastK means to use the last K messages for context, -1 for full message context
    public getCondenseQuestionPrompt(context: Chat, lastK: number = -1): string {
        const messageContext: Message[] = context.messages.slice((lastK === -1) ? 0 : context.messages.length - lastK - 1, context.messages.length - 1);
        const messageHistory: string = messagesToString(messageContext);
        const lastMessage: Message = context.messages[context.messages.length - 1];

        return this.condenseQuestionPrompt.replace(MESSAGE_CONTEXT_STRING, messageHistory).replace(TASK_STRING, lastMessage.content);
    }
}

export class GPTPrompt extends Prompt {
    protected systemPrompt: string = `You are an AI assistant that answers questions based on context from websites the user has visited. Prioritize context that is most relevant to the user's question, most recent, and with highest score. Provide a conversational answer. If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer and do not use markdown.`;
    protected taskPrompt: string = `Website Context:\n${WEBSITE_CONTEXT_STRING}\nMessage Context:\n${MESSAGE_CONTEXT_STRING}\nCurrent Time: ${DATETIME_STRING}\n\n\nQuestion: ${TASK_STRING}`;
    protected condenseQuestionPrompt: string = `Given the following conversation and latest message, decide if external data outside of the conversation needs to be retrieved to answer the message. If so, rephrase the message to be a standalone question and reply with only that question, nothing else. If a response can be made with the data on hand or they are saying something extremely general like "hey" or "what's up?", call the answerDirectly fuction.\n\nChat history:${MESSAGE_CONTEXT_STRING}\nLatest message: ${TASK_STRING}\nStandalone question: `;
}

export function messagesToString(messages: Message[]): string {
    return messages.map((message) => `${message.sender}: ${message.content}`).join('\n');
}
