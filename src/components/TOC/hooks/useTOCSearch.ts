import { useState, useMemo, useTransition, useCallback } from "react";
import { filterTree } from "../utils/filterTree";
import type { TOCNode } from "../types";

export const useTOCSearch = (tree: TOCNode[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const { tree: filteredTree, count } = useMemo(
    () => filterTree({ nodes: tree, query: appliedQuery }),
    [tree, appliedQuery]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(() => {
        setAppliedQuery(searchQuery.trim());
      });
    },
    [searchQuery]
  );

  const handleClear = useCallback(() => {
    startTransition(() => {
      setSearchQuery("");
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
    handleSearchSubmit,
    handleClear,
  };
};
