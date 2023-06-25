import browser from "webextension-polyfill";
import { VectorStorageDB } from "./util/vectordb";
import { useStore } from "./state/store";


let db = null;

useStore.subscribe((state) => state.key, (key) => {
  if (key) {
    db = new VectorStorageDB(key);
    console.log(`New DB created with key ${key}`)
  } else {
    db = null;
  }
});

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});
