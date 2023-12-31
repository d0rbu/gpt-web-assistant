import localforage from "localforage";
import { IVSSimilaritySearchItem } from "vector-storage";
import browser, { Runtime } from "webextension-polyfill";
import { getStorageInfo, splitDocument } from "./util/processSites";
import { Message, MessageMetadata, RawWebsiteContent, WebsiteContent, WebsiteMetadata } from "./util/types";
import { VectorDB, VectorStorageDB } from "./util/vectordb";


const CHUNK_SIZE: number = 300;
const VECTORDB_KEY: string = "vector-storage-key";
const FILTERING_MODE_KEY: string = "filtering-mode";
const BLOCK_ALLOW_LIST_KEY: string = "block-allow-list";

let vectordb: VectorDB<WebsiteMetadata | MessageMetadata> | null = null;
let filteringMode: string = "blocklist";
let blockAllowList: string[] = [];


function getVectorDB(key: string): VectorDB<WebsiteMetadata | MessageMetadata> | null {
  console.log("Key received", key);
  if (!key) {
    return null;
  }

  console.log(`DB connection created with key ${key}`)
  // store key persistently
  localforage.setItem(VECTORDB_KEY, key);
  return new VectorStorageDB(key);
}


browser.runtime.onConnect.addListener((port: Runtime.Port) => {
  console.log("Connected to port", port);
  let connected: boolean = false;

  if (port.name === "key") {
    port.onMessage.addListener((key: string) => {
      vectordb = getVectorDB(key);
    });

    connected = true;
  } else if (port.name === "page") {
    port.onMessage.addListener(async (website: RawWebsiteContent) => {
      console.log("Website received", website);
      if (!vectordb) {
        console.log(`No vectordb, not storing: ${website.url}`);
        port.postMessage(false);
        return;
      }

      const storageTime: number | null = await localforage.getItem(website.url);
      const { storageKey, maxAge }: { storageKey: string, maxAge: number } = getStorageInfo(website.url, blockAllowList, filteringMode);

      if (maxAge === -1) {
        console.log(`Website not stored: ${website.url}`);
        port.postMessage(true);
        return;
      }

      const earliestTime = Date.now() - maxAge;
      if (storageTime && storageTime > earliestTime) {
        console.log(`Website already stored: ${website.url}`);
        port.postMessage(true);
        return;
      }

      let chunks: string[]  = await splitDocument(website.parsed.textContent, CHUNK_SIZE, website.url);

      const contents: WebsiteContent[] = chunks.map((chunk) => {
        return {
          title: website.parsed.title,
          url: website.url,
          text: chunk,
          website: true,
        };
      });

      console.log(contents);

      const documents = await vectordb.add(contents);
      await localforage.setItem(storageKey, Date.now());
      console.log("Documents added", documents);
      port.postMessage(true);
    });

    connected = true;
  } else if (port.name === "message") {
    port.onMessage.addListener(async (message: Message) => {
      console.log("Message received", message);
      if (!vectordb) {
        port.postMessage(false);
        return;
      }

      const document = await vectordb.add(message);
      console.log("Message added", document);
      port.postMessage(true);
    });

    connected = true;
  } else if (port.name === "searchSites") {
    port.onMessage.addListener(async ({ query, k }: { query: string, k: number }) => {
      if (!vectordb) {
        port.postMessage([]);
        return;
      }

      const results: IVSSimilaritySearchItem<WebsiteMetadata>[] = await vectordb.searchWebsites(query, k);
      console.log("Website search results", results);
      port.postMessage(results);
    });
  } else if (port.name === "searchMessages") {
    port.onMessage.addListener(async ({ query, k, chatId }: { query: string, k: number, chatId: string }) => {
      if (!vectordb) {
        port.postMessage([]);
        return;
      }

      const results: IVSSimilaritySearchItem<MessageMetadata>[] = await vectordb.searchMessages(query, k, chatId);
      console.log("Message search results", results);
      port.postMessage(results);
    });
  } else if (port.name === "filteringMode") {
    port.onMessage.addListener(async (receivedFilteringMode: string) => {
      console.log("Filtering mode received", receivedFilteringMode);
      localforage.setItem(FILTERING_MODE_KEY, receivedFilteringMode);
      filteringMode = receivedFilteringMode;
    });
  } else if (port.name === "blockAllowList") {
    port.onMessage.addListener(async (receivedBlockAllowList: string[]) => {
      console.log("Block allow list received", receivedBlockAllowList);
      localforage.setItem(BLOCK_ALLOW_LIST_KEY, receivedBlockAllowList);
      blockAllowList = receivedBlockAllowList;
    });
  }

  port.onDisconnect.addListener(() => {
    console.log("Port disconnected");
  });
});

browser.runtime.onInstalled.addListener((details: any) => {
  console.log("Extension installed:", details);
});

browser.runtime.onStartup.addListener(async () => {
  console.log("Extension started");
  
  const key: string | null = await localforage.getItem(VECTORDB_KEY);
  if (key) {
    vectordb = getVectorDB(key);
  }
});
