import { useState, useCallback, useRef } from "react";
import type { TOCNode } from "../types";

export const useTreeNavigation = (tree: TOCNode[]) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const expandedRef = useRef(new Set<string>());

  const getVisibleNodes = useCallback((): TOCNode[] => {
    const visible: TOCNode[] = [];
    const walk = (nodes: TOCNode[]) => {
      for (const node of nodes) {
        visible.push(node);
        if (node.children.length > 0 && expandedRef.current.has(node.id)) {
          walk(node.children);
        }
      }
    };
    walk(tree);
    return visible;
  }, [tree]);

  const findParent = useCallback(
    (id: string): TOCNode | null => {
      const search = (
        nodes: TOCNode[],
        parent: TOCNode | null
      ): TOCNode | null => {
        for (const node of nodes) {
          if (node.id === id) return parent;
          const found = search(node.children, node);
          if (found) return found;
        }
        return null;
      };
      return search(tree, null);
    },
    [tree]
  );

  const onFocusNode = useCallback((id: string) => {
    setFocusedId(id);
  }, []);

  const onMoveFocus = useCallback(
    (id: string, direction: "up" | "down" | "home" | "end" | "parent") => {
      if (direction === "parent") {
        const parent = findParent(id);
        if (parent) setFocusedId(parent.id);
        return;
      }

      const visible = getVisibleNodes();
      if (visible.length === 0) return;

      if (direction === "home") {
        setFocusedId(visible[0].id);
        return;
      }
      if (direction === "end") {
        setFocusedId(visible[visible.length - 1].id);
        return;
      }

      const idx = visible.findIndex((n) => n.id === id);
      if (idx === -1) return;

      if (direction === "down" && idx < visible.length - 1) {
        setFocusedId(visible[idx + 1].id);
      } else if (direction === "up" && idx > 0) {
        setFocusedId(visible[idx - 1].id);
      }
    },
    [getVisibleNodes, findParent]
  );

  const trackExpanded = useCallback((id: string, isExpanded: boolean) => {
    if (isExpanded) {
      expandedRef.current.add(id);
    } else {
      expandedRef.current.delete(id);
    }
  }, []);

  return { focusedId, onFocusNode, onMoveFocus, trackExpanded };
};
