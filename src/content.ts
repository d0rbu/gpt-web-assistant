import browser, { Runtime } from "webextension-polyfill";
import { RawWebsiteContent } from "./util/types";

// wait until website ready
window.addEventListener("load", async () => {
  // get current url
  const url: string = window.location.href;

  // get website content
  const content: string = document.documentElement.outerHTML;

  const rawContent: RawWebsiteContent = {
    url,
    document: content,
  };

  // send to background script
  const port: Runtime.Port = browser.runtime.connect({ name: "page" });
  port.postMessage(rawContent);

  console.log("Website sent", rawContent);
});
