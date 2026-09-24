export const GITHUB_URL = "https://github.com/jabluetooth/match";

/** Deep link to a file in the repo, so every engineering claim can be checked. */
export const sourceUrl = (path: string) => `${GITHUB_URL}/blob/main/${path}`;

export const SECTIONS = [
  { id: "loop", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "engineering", label: "Engineering" },
  { id: "security", label: "Security" },
] as const;
