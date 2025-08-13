import { normalize } from "../../../utils/normalize";
import type { TOCNode } from "../types";

interface IFilterTreeParams {
  nodes: TOCNode[];
  query: string;
}

interface IFilterTreeResult {
  tree: TOCNode[];
  count: number;
}

export const filterTree = ({
  nodes,
  query,
}: IFilterTreeParams): IFilterTreeResult => {
  if (!query.trim()) return { tree: nodes, count: 0 };

  const q = normalize(query);
  let total = 0;

  const visit = (node: TOCNode): TOCNode | null => {
    const selfMatch = normalize(node.title).includes(q);
    const filteredChildren = node.children
      .map(visit)
      .filter((n): n is TOCNode => Boolean(n));

    const hasMatch = selfMatch || filteredChildren.length > 0;
    if (!hasMatch) return null;

    if (selfMatch) total += 1;

    return { ...node, children: filteredChildren };
  };

  const filtered = nodes.map(visit).filter((n): n is TOCNode => Boolean(n));

  const countDescendants = (n: TOCNode) => {
    for (const c of n.children) countDescendants(c);
  };
  filtered.forEach(countDescendants);

  return { tree: filtered, count: total };
};
