import browser, { Runtime } from "webextension-polyfill";
import { VectorStorageDB, VectorDB } from "./util/vectordb";
import { RawWebsiteContent, WebsiteContent, WebsiteMetadata } from "./util/types";
import { splitDocument, getStorageInfo } from "./util/processSites";
import { IVSSimilaritySearchItem } from "vector-storage";
import localforage from "localforage";


let vectordb: VectorDB | null = null;
const CHUNK_SIZE: number = 1000;


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
        return;
      }

      const storageTime: number | null = await localforage.getItem(website.url);
      const { storageKey, maxAge }: { storageKey: string, maxAge: number } = getStorageInfo(website.url);

      if (maxAge === -1) {
        console.log(`Website not stored: ${website.url}`);
        return;
      }

      const earliestTime = Date.now() - maxAge;
      if (storageTime && storageTime > earliestTime) {
        console.log(`Website already stored: ${website.url}`);
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
    });

    connected = true;
  } else if (port.name === "search") {
    port.onMessage.addListener(async ({ query, k }: { query: string, k: number }) => {
      if (!vectordb) {
        return;
      }

      const results: IVSSimilaritySearchItem<WebsiteMetadata>[] = await vectordb.search(query, k);
      console.log("Search results", results);
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
