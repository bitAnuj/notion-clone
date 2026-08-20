import * as Y from "yjs";

const yjsDocCache = new Map<string, Y.Doc>();

export function getYjsDoc(pageId: string): Y.Doc {
  if (!yjsDocCache.has(pageId)) {
    yjsDocCache.set(pageId, new Y.Doc());
  }
  return yjsDocCache.get(pageId)!;
}

export function hasYjsDoc(pageId: string): boolean {
  return yjsDocCache.has(pageId);
}
