import { IVSDocument, IVSSimilaritySearchItem } from "vector-storage";
import { WebsiteMetadata } from "./types";
import { Chat, Message } from "./types";


const CONTEXT_STRING = '{{CONTEXT}}';
const TASK_STRING = '{{TASK}}';
const DATETIME_STRING = '{{TIME}}';


export abstract class Prompt {
    protected abstract systemPrompt: string;
    protected abstract taskPrompt: string;
    protected abstract condenseQuestionPrompt: string;

    public getTaskPrompt(context: IVSSimilaritySearchItem<WebsiteMetadata>[], task: string): string {
        let textContext = ""

        for (const item of context) {
            textContext += `${item.metadata.title}\n`
            const datetime = new Date(item.timestamp);
            textContext += `${datetime.toLocaleString()}\n`;
            textContext += `${item.metadata.url}\n`;
            textContext += `Score: ${item.score}\n\n`;
            textContext += `${item.text}\n\n`;
        }

        return this.taskPrompt.replace(CONTEXT_STRING, textContext).replace(TASK_STRING, task).replace(DATETIME_STRING, `${new Date().toLocaleString()}\n\n`);
    }

    public getSystemPrompt(): string {
        return this.systemPrompt;
    }

    public getCondenseQuestionPrompt(context: Chat): string {
        const messageHistory = messagesToString(context.messages.slice(0, context.messages.length - 1));
        const lastMessage = context.messages[context.messages.length - 1];

        return this.condenseQuestionPrompt.replace(CONTEXT_STRING, messageHistory).replace(TASK_STRING, lastMessage.content);
    }
}

export class GPTPrompt extends Prompt {
    protected systemPrompt: string = `You are an AI assistant that answers questions based on context from websites the user has visited. Prioritize context that is most relevant to the user's question, most recent, and with highest score. Provide a conversational answer. If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer and do not use markdown.`;
    protected taskPrompt: string = `Context:\n${CONTEXT_STRING}Current Time: ${DATETIME_STRING}Question: ${TASK_STRING}`;
    protected condenseQuestionPrompt: string = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.\n\nChat history:${CONTEXT_STRING}\nFollow up question: ${TASK_STRING}\nStandalone question: `;
}

export function messagesToString(messages: Message[]): string {
    return messages.map((message) => `${message.sender}: ${message.content}`).join('\n');
}
