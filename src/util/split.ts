const DELIMITERS = ["\n\n\n", "\n\n", "\n", "   ", "  ", " ", ".", ",", "-"];
const MIN_LENGTH = 10;


const WEBSITE_SPLITTERS: { [key: string]: (document: string, chunkSize: number, url: string) => string[] } = {
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