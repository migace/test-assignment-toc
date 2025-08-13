import { type TOCData, type TOCNode } from "../components/TOC/types";

export function buildTree(data: TOCData): TOCNode[] {
  const { pages } = data.entities;
  const { topLevelIds } = data;
  const pageMap = new Map(Object.entries(pages));

  const buildNode = (id: string): TOCNode => {
    const page = pageMap.get(id)!;

    return {
      ...page,
      children: page.pages?.map(buildNode) || [],
      anchors: [],
    };
  };

  return topLevelIds.map(buildNode);
}
