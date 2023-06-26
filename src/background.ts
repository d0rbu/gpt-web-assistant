import browser, { Runtime } from "webextension-polyfill";
import { VectorStorageDB, VectorDB } from "./util/vectordb";
import { WebsiteContent, WebsiteMetadata } from "./util/types";


let db: VectorDB | null = null;

browser.runtime.onConnect.addListener((port: Runtime.port) => {
  console.log("Connected to port", port);

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
  }

  port.onDisconnect.addListener(() => {
    console.log("Port disconnected");
  });
});

browser.runtime.onInstalled.addListener((details: any) => {
  console.log("Extension installed:", details);
});
