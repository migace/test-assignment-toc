import {
  type Anchor,
  type TOCData,
  type TOCNode,
} from "../components/TOC/types";

export function buildTree(data: TOCData): TOCNode[] {
  const { pages, anchors } = data.entities;
  const { topLevelIds } = data;
  const pageMap = new Map(Object.entries(pages));

  const anchorsByUrl = new Map<string, Anchor[]>();
  if (anchors) {
    for (const anchor of Object.values(anchors)) {
      const existing = anchorsByUrl.get(anchor.url) ?? [];
      existing.push(anchor);
      anchorsByUrl.set(anchor.url, existing);
    }
  }

  const buildNode = (id: string): TOCNode => {
    const page = pageMap.get(id);
    if (!page) {
      throw new Error(`Page with id "${id}" not found in TOC data`);
    }

    return {
      ...page,
      children: page.pages?.map(buildNode) || [],
      anchors: page.url ? (anchorsByUrl.get(page.url) ?? []) : [],
    };
  };

  return topLevelIds.map(buildNode);
}
