import { WebsiteContent, WebsiteMetadata, Message, MessageMetadata } from "./types";
import { VectorStorage, IVSDocument, IVSSimilaritySearchParams, IVSSimilaritySearchItem, IVSFilterOptions } from "vector-storage";


export abstract class VectorDB {
    public async add(content: WebsiteContent | WebsiteContent[] | Message | Message[]): Promise<IVSDocument<WebsiteMetadata | MessageMetadata>[] | IVSDocument<WebsiteMetadata | MessageMetadata>> {
        if (content instanceof Array) {
            return this.addContents(content);
        } else {
            return this.addContents([content]).then((docs) => docs[0]);
        }
    }
    public abstract searchWebsites(query: string, k?: number): Promise<IVSSimilaritySearchItem<WebsiteMetadata>[]>;
    public abstract searchMessages(query: string, k?: number, chatId?: string): Promise<IVSSimilaritySearchItem<MessageMetadata>[]>;
    
    protected abstract addContents(contents: (WebsiteContent | Message)[]): Promise<IVSDocument<WebsiteMetadata | MessageMetadata>[]>;
}


function isWebsiteMetadata(content: WebsiteMetadata | MessageMetadata): content is WebsiteMetadata {
    return (content as WebsiteMetadata).url !== undefined;
}


export class VectorStorageDB extends VectorDB {
    private store: VectorStorage<WebsiteMetadata | MessageMetadata>;
    
    constructor(key: string) {
        super();
        this.store = new VectorStorage<WebsiteMetadata | MessageMetadata>({
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

    public async searchFiltered(query: string, k?: number, filterOptions?: IVSFilterOptions): Promise<IVSSimilaritySearchItem<WebsiteMetadata | MessageMetadata>[]> {
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

    protected async addContents(contents: WebsiteContent[] | Message[]): Promise<IVSDocument<WebsiteMetadata | MessageMetadata>[]> {
        const { texts, metadatas }: { texts: string[], metadatas: WebsiteMetadata[] | MessageMetadata[] } = contents.reduce((accumulator: { texts: string[], metadatas: WebsiteMetadata[] | MessageMetadata[] }, content: WebsiteContent | Message) => {
            if (isWebsiteMetadata(content)) {
                accumulator.texts.push(content.text);
                // push everything but text
                (accumulator.metadatas as WebsiteMetadata[]).push({
                    title: content.title,
                    url: content.url,
                    website: true,
                });
                return accumulator;
            } else {
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

