const DELIMITERS = ["\n\n\n", "\n\n", "\n", "   ", "  ", " ", ".", ",", "-"];
const MIN_LENGTH = 10;
const DEFAULT_MAX_AGE = 1000 * 60 * 60 * 24 * 200;  // 200 days


const WEBSITE_SPLITTERS: { [key: string]: (document: string, chunkSize: number, url: string) => string[] } = {
}

const WEBSITE_INFO_FNS: { [key: string]: (components: URLComponents) => { storageKey: string, maxAge: number } } = {
  "youtube.com": (components) => {
    if (!components.query) {
      return {
        storageKey: components.website,
        maxAge: -1,
      }
    }

    return {
      storageKey: components.website + "/" + components.path + "?" + components.query,
      maxAge: DEFAULT_MAX_AGE
    }
  },
  "google.com": (components) => {
    return {
      storageKey: components.website,
      maxAge: -1,
    }
  }
}


interface URLComponents {
  protocol: string;
  website: string;
  path: string;
  query: string;
  hash: string;
}

export function decomposeURL(url: string): URLComponents {
  const protocol: string = url.split("://")[0];
  const website = url.split("://")[1].split("/")[0].replace("www.", "");
  const path: string = url.split("://")[1].split("/").slice(1).join("/");
  const query: string = path.split("?")[1] || "";
  const hash: string = path.split("#")[1] || "";
  
  return { protocol, website, path, query, hash };
}


function containsWebsite(blockAllowList: string[], url: string): boolean {
  // check each item in blockallowlist as regex
  for (const item of blockAllowList) {
    const regex: RegExp = new RegExp(item);
    if (regex.test(url)) {
      return true;
    }
  }

  return false;
}


export function getStorageInfo(url: string, blockAllowList: string[], filteringMode: string): { storageKey: string, maxAge: number } {
  if (filteringMode === "blocklist" && containsWebsite(blockAllowList, url)) {
    return {
      storageKey: url,
      maxAge: -1,
    }
  } else if (filteringMode === "allowlist" && !containsWebsite(blockAllowList, url)) {
    return {
      storageKey: url,
      maxAge: -1,
    }
  }

  const components: URLComponents = decomposeURL(url);
  if (WEBSITE_INFO_FNS[components.website]) {
    return WEBSITE_INFO_FNS[components.website](components);
  }

  return {
    storageKey: components.website + "/" + components.path + "?" + components.query + "#" + components.hash,
    maxAge: DEFAULT_MAX_AGE,
  }
}


export async function splitDocument(document: string, chunkSize: number, url: string): Promise<string[]> {
  let website: string = url.split("/")[2];
  if (website.startsWith("www.")) {
    website = website.substring(4);
  }

  if (WEBSITE_SPLITTERS[website]) {
    return WEBSITE_SPLITTERS[website](document, chunkSize, url);
  }

  return recursiveSplitDocument(document, chunkSize, url, 0);
}


export async function recursiveSplitDocument(document: string, chunkSize: number, url: string, delimiterIdx: number): Promise<string[]> {
  const doc: string = document.trim();
  
  if (delimiterIdx >= DELIMITERS.length || doc.length <= chunkSize) {
    return [doc];
  }

  const delimiter: string = DELIMITERS[delimiterIdx];
  const splitDoc: string[] = doc.split(delimiter).filter((chunk: string) => chunk.length >= MIN_LENGTH);

  const rawChunks: string[] = [];
  for (const chunk of splitDoc) {
    const subChunks: string[] = await recursiveSplitDocument(chunk, chunkSize, url, delimiterIdx + 1);
    rawChunks.push(...subChunks);
  }

  const chunks: string[] = [];
  let currentChunk: string = "";
  for (const rawChunk of rawChunks) {
    if (currentChunk.length + rawChunk.length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = rawChunk;
    } else {
      currentChunk += rawChunk + delimiter;
    }
  }

  if (currentChunk.length > 0) {  // push out last remaining chunk if it exists
    chunks.push(currentChunk);
  }

  return chunks;
}