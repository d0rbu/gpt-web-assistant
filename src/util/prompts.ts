import { IVSDocument, IVSSimilaritySearchItem } from "vector-storage";
import { WebsiteMetadata } from "./types";


const CONTEXT_STRING = '{{CONTEXT}}';
const TASK_STRING = '{{TASK}}';
const DATETIME_STRING = '{{TIME}}';


export abstract class Prompt {
    protected abstract systemPrompt: string;
    protected abstract taskPrompt: string;

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
}

export class GPTPrompt extends Prompt {
    protected systemPrompt: string = `You are an AI assistant that answers questions based on context from websites the user has visited. The questions are structured with the context first, followed by the current time, then the question or task. Prioritize context that is most relevant to the user's question, most recent, and with highest score.`;
    protected taskPrompt: string = `Context:\n${CONTEXT_STRING}Current Time: ${DATETIME_STRING}Question: ${TASK_STRING}`;
}
