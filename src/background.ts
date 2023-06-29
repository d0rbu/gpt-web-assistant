import browser, { Runtime } from "webextension-polyfill";
import { VectorStorageDB, VectorDB } from "./util/vectordb";
import { RawWebsiteContent, WebsiteContent, WebsiteMetadata } from "./util/types";
import { splitDocument } from "./util/split";


let db: VectorDB | null = null;
const CHUNK_SIZE: number = 1000;


browser.runtime.onConnect.addListener((port: Runtime.Port) => {
  console.log("Connected to port", port);
  let connected: boolean = false;

  if (port.name === "key") {
    port.onMessage.addListener((key: string) => {
      console.log("Key received", key);
      if (key) {
        db = new VectorStorageDB(key);
        console.log(`DB connection created with key ${key}`)
      } else {
        db = null;
      }
    });

    connected = true;
  } else if (port.name === "page") {
    port.onMessage.addListener(async (website: RawWebsiteContent) => {
      console.log("Website received", website);
      if (db) {
        let chunks: string[]  = await splitDocument(website.parsed.textContent, CHUNK_SIZE, website.url);

        const contents: WebsiteContent[] = chunks.map((chunk) => {
          return {
            title: website.parsed.title,
            url: website.url,
            text: chunk,
          };
        });

        console.log(contents);

        // const documents = await db.add(contents);
        // console.log("Documents added", documents);
      }
    });

    connected = true;
  }

  port.onDisconnect.addListener(() => {
    console.log("Port disconnected");
  });
});

browser.runtime.onInstalled.addListener((details: any) => {
  console.log("Extension installed:", details);
});
