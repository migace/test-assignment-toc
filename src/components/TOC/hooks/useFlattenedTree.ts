import { useMemo } from "react";
import type { TOCNode } from "../types";

export interface FlatNode {
  node: TOCNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  setSize: number;
  posInSet: number;
  parentId: string | null;
}

export const useFlattenedTree = (
  tree: TOCNode[],
  expandedIds: Set<string>
): FlatNode[] => {
  return useMemo(() => {
    const result: FlatNode[] = [];

    const walk = (nodes: TOCNode[], depth: number, parentId: string | null) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedIds.has(node.id);

        result.push({
          node,
          depth,
          hasChildren,
          isExpanded,
          setSize: nodes.length,
          posInSet: i + 1,
          parentId,
        });

        if (hasChildren && isExpanded) {
          walk(node.children, depth + 1, node.id);
        }
      }
    };

    walk(tree, 0, null);
    return result;
  }, [tree, expandedIds]);
};
