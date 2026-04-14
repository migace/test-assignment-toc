import { useState, useCallback, useEffect } from "react";
import type { TOCNode } from "../types";

export const useExpandedState = (
  activeId: string | null,
  tree: TOCNode[],
  searchActive = false
) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const collapse = useCallback((id: string) => {
    setExpandedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Auto-expand all parent nodes when search is active so results are visible
  useEffect(() => {
    if (!searchActive) return;

    const parentIds = new Set<string>();
    const collectParents = (nodes: TOCNode[]) => {
      for (const node of nodes) {
        if (node.children.length > 0) {
          parentIds.add(node.id);
          collectParents(node.children);
        }
      }
    };
    collectParents(tree);

    if (parentIds.size > 0) {
      setExpandedIds(parentIds);
    }
  }, [searchActive, tree]);

  // Auto-expand ancestors of active node
  useEffect(() => {
    if (!activeId) return;

    const findPath = (
      nodes: TOCNode[],
      targetId: string,
      path: string[]
    ): string[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) return path;
        if (node.children.length > 0) {
          const found = findPath(node.children, targetId, [...path, node.id]);
          if (found) return found;
        }
      }
      return null;
    };

    const ancestorPath = findPath(tree, activeId, []);
    if (ancestorPath && ancestorPath.length > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const id of ancestorPath) {
          next.add(id);
        }
        return next;
      });
    }
  }, [activeId, tree]);

  return { expandedIds, toggle, expand, collapse };
};
