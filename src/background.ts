import localforage from "localforage";
import { IVSSimilaritySearchItem } from "vector-storage";
import browser, { Runtime } from "webextension-polyfill";
import { getStorageInfo, splitDocument } from "./util/processSites";
import { Message, MessageMetadata, RawWebsiteContent, WebsiteContent, WebsiteMetadata } from "./util/types";
import { VectorDB, VectorStorageDB } from "./util/vectordb";


let vectordb: VectorDB<WebsiteMetadata | MessageMetadata> | null = null;
const CHUNK_SIZE: number = 300;


browser.runtime.onConnect.addListener((port: Runtime.Port) => {
  console.log("Connected to port", port);
  let connected: boolean = false;

  if (port.name === "key") {
    port.onMessage.addListener((key: string) => {
      console.log("Key received", key);
      if (key) {
        vectordb = new VectorStorageDB(key);
        console.log(`DB connection created with key ${key}`)
      } else {
        vectordb = null;
      }
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
      const { storageKey, maxAge }: { storageKey: string, maxAge: number } = getStorageInfo(website.url);

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
  }

  port.onDisconnect.addListener(() => {
    console.log("Port disconnected");
  });
});

browser.runtime.onInstalled.addListener((details: any) => {
  console.log("Extension installed:", details);
});
