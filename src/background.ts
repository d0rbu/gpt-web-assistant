import browser, { Runtime } from "webextension-polyfill";
import { VectorStorageDB, VectorDB } from "./util/vectordb";
import { RawWebsiteContent, WebsiteContent, WebsiteMetadata } from "./util/types";
import { IVSDocument } from "vector-storage";
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import * as cheerio from "cheerio";


let db: VectorDB | null = null;


async function splitDocument(text: string, url: string) {
  const rawDocs = new Document({
    pageContent: text,
    metadata: { source: url, type: "scrape" },
  })
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  })
  const docs = await textSplitter.splitDocuments([rawDocs])

  return docs
}


browser.runtime.onConnect.addListener((port: Runtime.port) => {
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
        const $ = cheerio.load(website.document);
        const title: string = $("title").text();
        const text: string = $("body").text();

        let chunks: Document[]  = await splitDocument(text, website.url);

        const contents = chunks.map((chunk) => {
          return {
            title,
            url: website.url,
            text: chunk.pageContent,
          };
        });

        const documents = await db.add(contents);
        console.log("Documents added", documents);
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
