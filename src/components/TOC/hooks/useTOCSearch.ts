import { useState, useMemo, useTransition, useCallback } from "react";
import { filterTree } from "../utils/filterTree";
import type { TOCNode } from "../types";

const STORAGE_KEY = "toc-search-query";

const getPersistedQuery = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const persistQuery = (query: string) => {
  try {
    if (query) {
      localStorage.setItem(STORAGE_KEY, query);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
};

export const useTOCSearch = (tree: TOCNode[]) => {
  const [searchQuery, setSearchQuery] = useState(getPersistedQuery);
  const [appliedQuery, setAppliedQuery] = useState(getPersistedQuery);
  const [isPending, startTransition] = useTransition();

  const { tree: filteredTree, count } = useMemo(
    () => filterTree({ nodes: tree, query: appliedQuery }),
    [tree, appliedQuery]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      const trimmed = value.trim();
      persistQuery(trimmed);
      startTransition(() => {
        setAppliedQuery(trimmed);
      });
    },
    []
  );

  const handleClear = useCallback(() => {
    persistQuery("");
    setSearchQuery("");
    startTransition(() => {
      setAppliedQuery("");
    });
  }, []);

  return {
    searchQuery,
    appliedQuery,
    isPending,
    filteredTree,
    count,
    handleSearchChange,
    handleClear,
  };
};
