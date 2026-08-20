interface LinkMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  favicon?: string;
}

const CACHE_KEY = "vicharhub-link-cache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCache(): Record<string, LinkMetadata & { cachedAt: number }> {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata | null> {
  // Check cache first
  const cache = getCache();
  if (cache[url] && Date.now() - cache[url].cachedAt < CACHE_DURATION) {
    return cache[url];
  }

  try {
    // Use a CORS proxy to fetch the page
    const response = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`);

    if (!response.ok) {
      // Fallback: try textise dot iitty
      const fallbackResponse = await fetch(`https://r.jina.ai/http://${url}`);
      if (!fallbackResponse.ok) throw new Error("Failed to fetch");
      const text = await fallbackResponse.text();
      return parseJinaResponse(text, url);
    }

    const text = await response.text();
    return parseJinaResponse(text, url);
  } catch {
    // Fallback: basic metadata from URL
    return {
      title: url,
      description: "",
      url,
    };
  }
}

function parseJinaResponse(text: string, url: string): LinkMetadata {
  // Jina AI returns structured text with title, description, etc.
  const lines = text.split("\n");
  let title = url;
  let description = "";
  let image: string | undefined;

  for (const line of lines) {
    if (line.startsWith("Title: ")) title = line.replace("Title: ", "");
    else if (line.startsWith("Description: ")) description = line.replace("Description: ", "");
    else if (line.startsWith("Image: ")) image = line.replace("Image: ", "");
  }

  return { title, description, image, url };
}

// Extract domain for favicon
export function getFavicon(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return "";
  }
}
