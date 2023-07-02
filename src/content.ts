import browser, { Runtime } from "webextension-polyfill";
import { RawWebsiteContent } from "./util/types";
import { Readability } from "@mozilla/readability";


const SEND_DELAY: number = 8000;
const sitesSent: Set<string> = new Set();


async function sendWebsite() {
  // get current url
  const url: string = window.location.href;

  if (sitesSent.has(url)) {
    return;
  }
  sitesSent.add(url);

  console.log(`Sending website ${url} in ${SEND_DELAY}ms`);

  await new Promise((resolve) => setTimeout(resolve, SEND_DELAY));

  if (window.location.href !== url) {
    return;
  }

  console.log(`Sending website ${url}`);

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

  // listen for response
  port.onMessage.addListener((success: boolean) => {
    if (!success) {
      console.log(`Website not stored: ${url}`);
      sitesSent.delete(url);
    }
  });
}

const observer: MutationObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "attributes" && mutation.attributeName === "href") {
      sendWebsite();
    }
  }
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["href"],
  subtree: true
});

window.addEventListener("load", sendWebsite);
