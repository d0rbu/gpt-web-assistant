import { WebsiteContent, WebsiteMetadata } from "./types";
import { VectorStorage, IVSDocument, IVSSimilaritySearchParams, IVSSimilaritySearchItem } from "vector-storage";


export abstract class VectorDB {
    public async add(content: WebsiteContent | WebsiteContent[]): Promise<IVSDocument<WebsiteMetadata>[] | IVSDocument<WebsiteMetadata>> {
        if (content instanceof Array) {
            return this.addContents(content);
        } else {
            return this.addContents([content]).then((docs) => docs[0]);
        }
    }
    public abstract search(query: string, k?: number): Promise<IVSDocument<WebsiteMetadata>[]>;
    
    protected abstract addContents(contents: WebsiteContent[]): Promise<IVSDocument<WebsiteMetadata>[]>;
}


export class VectorStorageDB extends VectorDB {
    private store: VectorStorage<WebsiteMetadata>;
    
    constructor(key: string) {
        super();
        this.store = new VectorStorage<WebsiteMetadata>({
            openAIApiKey: key,
            openaiModel: "text-embedding-ada-002",
        });
    }

    public async search(query: string, k?: number): Promise<IVSSimilaritySearchItem<WebsiteMetadata>[]> {
        const searchParams: IVSSimilaritySearchParams = {
            query,
            k,
        };

        return this.store.similaritySearch(searchParams).then(({ similarItems, query }) => similarItems);
    }

    protected async addContents(contents: WebsiteContent[]): Promise<IVSDocument<WebsiteMetadata>[]> {
        const { texts, metadatas }: { texts: string[], metadatas: WebsiteMetadata[] } = contents.reduce((accumulator: { texts: string[], metadatas: WebsiteMetadata[] }, content: WebsiteContent) => {
            accumulator.texts.push(content.text);
            accumulator.metadatas.push({ url: content.url, title: content.title });
            return accumulator;
        }, {
            texts: [],
            metadatas: [],
        });

        return this.store.addTexts(texts, metadatas);
    }
}

