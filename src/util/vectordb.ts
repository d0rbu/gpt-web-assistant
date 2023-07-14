import { WebsiteContent, WebsiteMetadata, Message, MessageMetadata } from "./types";
import { VectorStorage, IVSDocument, IVSSimilaritySearchParams, IVSSimilaritySearchItem, IVSFilterOptions } from "vector-storage";


export abstract class VectorDB<T> {
    public async add(content: T | T[]): Promise<IVSDocument<T>[] | IVSDocument<T>> {
        if (content instanceof Array) {
            return this.addContents(content);
        } else {
            return this.addContents([content]).then((docs) => docs[0]);
        }
    }
    public abstract searchWebsites(query: string, k?: number): Promise<IVSSimilaritySearchItem<WebsiteMetadata>[]>;
    public abstract searchMessages(query: string, k?: number, chatId?: string): Promise<IVSSimilaritySearchItem<MessageMetadata>[]>;
    
    protected abstract addContents(contents: T[]): Promise<IVSDocument<T>[]>;
}


function isWebsiteMetadata(content: any): content is WebsiteMetadata {
    return (content as WebsiteMetadata).url !== undefined;
}


export class VectorStorageDB<T> extends VectorDB<T> {
    private store: VectorStorage<T>;
    
    constructor(key: string) {
        super();
        this.store = new VectorStorage<T>({
            openAIApiKey: key,
            openaiModel: "text-embedding-ada-002",
        });
    }

    public async searchWebsites(query: string, k?: number) {
        const filterOptions: IVSFilterOptions = {
            include: {
                metadata: {
                    website: true,
                },
            },
        };

        return this.searchFiltered(query, k, filterOptions).then((results) => results as IVSSimilaritySearchItem<WebsiteMetadata>[]);
    }

    public async searchMessages(query: string, k?: number, chatId?: string) {
        const filterOptions: IVSFilterOptions = {
            include: {
                metadata: {
                    website: false,
                },
            },
        };

        if (chatId && filterOptions?.include?.metadata) {
            filterOptions.include.metadata.chatId = chatId;
        }

        return this.searchFiltered(query, k, filterOptions).then((results) => results as IVSSimilaritySearchItem<MessageMetadata>[]);
    }

    public async searchFiltered(query: string, k?: number, filterOptions?: IVSFilterOptions): Promise<IVSSimilaritySearchItem<T>[]> {
        const searchParams: IVSSimilaritySearchParams = {
            query,
            k,
            filterOptions,
        };

        return this.store.similaritySearch(searchParams).then(({ similarItems, query }) => {
            console.log(`Query:`);
            console.log(query);
            console.log(`Similar Items:`);
            console.log(similarItems);

            return similarItems;
        });
    }

    protected async addContents(contents: T[]): Promise<IVSDocument<T>[]> {
        const { texts, metadatas }: { texts: string[], metadatas: T[] } = contents.reduce((accumulator: { texts: string[], metadatas: T[] }, content: any) => {
            if (isWebsiteMetadata(content)) {
                const websiteContent = content as WebsiteContent;
                accumulator.texts.push(websiteContent.text);
                // push everything but text
                (accumulator.metadatas as WebsiteMetadata[]).push({
                    title: content.title,
                    url: content.url,
                    website: true,
                });
                return accumulator;
            } else {
                const messageContent = content as Message;
                accumulator.texts.push(content.content);
                // push everything but message contents
                (accumulator.metadatas as MessageMetadata[]).push({
                    chatId: content.chatId,
                    sender: content.sender,
                    website: false,
                });
                return accumulator;
            }
        }, {
            texts: [],
            metadatas: [],
        });

        return this.store.addTexts(texts, metadatas);
    }
}

