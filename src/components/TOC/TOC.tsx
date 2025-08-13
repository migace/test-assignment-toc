import { useState, useMemo, useTransition, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTOC } from "../../api/tocApi";
import { buildTree } from "../../utils/buildTree";

import { ToCItem } from "./ToCItem";
import Loader from "../Loader/Loader";
import styles from "./TOC.module.css";
import { filterTree } from "./utils/filterTree";

export const ToC = () => {
  const {
    data: tree = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["toc"],
    queryFn: fetchTOC,
    select: (raw) => buildTree(raw),
    staleTime: 5 * 60 * 1000,
  });

  const [activeId, setActiveId] = useState<string | null>(null);
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

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className={styles.error}>
        <p>Failed to load the table of contents.</p>
        <button onClick={() => location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.tocContainer}>
      <form
        onSubmit={handleSearchSubmit}
        className={styles.searchForm}
        role="search"
      >
        <input
          id="toc-search"
          type="text"
          placeholder="Search in TOC..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
          aria-label="Search in table of contents"
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
        {(appliedQuery || searchQuery) && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
          >
            X
          </button>
        )}
      </form>

      {isPending && (
        <div className={styles.filteringLoader} aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <span>Filtering results…</span>
        </div>
      )}

      {appliedQuery && !isPending && (
        <div className={styles.searchInfo} aria-live="polite">
          Found {count} result{count === 1 ? "" : "s"} for “{appliedQuery}”
        </div>
      )}

      <nav className={styles.toc} aria-label="Table of contents">
        {filteredTree.map((node) => (
          <ToCItem
            key={node.id}
            node={node}
            activeId={activeId}
            onActivate={setActiveId}
          />
        ))}
      </nav>

      {appliedQuery && !isPending && filteredTree.length === 0 && (
        <div className={styles.noResults} aria-live="polite">
          No results found for “{appliedQuery}”
        </div>
      )}
    </div>
  );
};
