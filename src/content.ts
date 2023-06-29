import browser, { Runtime } from "webextension-polyfill";
import { RawWebsiteContent } from "./util/types";
import { Readability } from "@mozilla/readability";

// wait until website ready
window.addEventListener("load", async () => {
  // get current url
  const url: string = window.location.href;

  const reader: Readability = new Readability(document.cloneNode(true) as Document);
  const parsed = reader.parse();

  if (parsed === null) {
    return;
  }

  const rawContent: RawWebsiteContent = {
    url,
    parsed,
  };

  // send to background script
  const port: Runtime.Port = browser.runtime.connect({ name: "page" });
  port.postMessage(rawContent);

  console.log("Website sent", rawContent);
});
