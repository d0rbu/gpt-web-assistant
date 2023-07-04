import browser, { Runtime } from "webextension-polyfill";
import { VectorStorageDB, VectorDB } from "./util/vectordb";
import { RawWebsiteContent, WebsiteContent, WebsiteMetadata, Message, MessageMetadata } from "./util/types";
import { splitDocument, getStorageInfo } from "./util/processSites";
import { IVSSimilaritySearchItem } from "vector-storage";
import localforage from "localforage";


let vectordb: VectorDB | null = null;
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
        return;
      }

      const results: IVSSimilaritySearchItem<WebsiteMetadata>[] = await vectordb.searchWebsites(query, k);
      console.log("Website search results", results);
      port.postMessage(results);
    });
  } else if (port.name === "searchMessages") {
    port.onMessage.addListener(async ({ query, k }: { query: string, k: number }) => {
      if (!vectordb) {
        return;
      }

      const results: IVSSimilaritySearchItem<MessageMetadata>[] = await vectordb.searchMessages(query, k);
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
