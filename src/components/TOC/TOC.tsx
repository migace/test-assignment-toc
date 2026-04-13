import { useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { TOCRow } from "./TOCRow";
import Loader from "../Loader/Loader";
import { ITEM_HEIGHT_PX, VIRTUALIZER_OVERSCAN } from "./constants";
import styles from "./TOC.module.css";
import { useTOCData } from "./hooks/useTOCData";
import { useTOCSearch } from "./hooks/useTOCSearch";
import { useFlattenedTree } from "./hooks/useFlattenedTree";
import { useExpandedState } from "./hooks/useExpandedState";
import type { FlatNode } from "./hooks/useFlattenedTree";

export const ToC = () => {
  const { data: tree = [], isLoading, error, refetch } = useTOCData();

  const [activeId, setActiveId] = useState<string | null>(null);

  const {
    searchQuery,
    appliedQuery,
    isPending,
    filteredTree,
    count,
    handleSearchChange,
    handleSearchSubmit,
    handleClear,
  } = useTOCSearch(tree);

  const { expandedIds, toggle } = useExpandedState(activeId, filteredTree);

  const flatNodes = useFlattenedTree(filteredTree, expandedIds);

  const scrollRef = useRef<HTMLUListElement>(null);

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_HEIGHT_PX,
    overscan: VIRTUALIZER_OVERSCAN,
  });

  const [focusedId, setFocusedId] = useState<string | null>(null);

  const onFocusNode = useCallback((id: string) => {
    setFocusedId(id);
  }, []);

  const onMoveFocus = useCallback(
    (id: string, direction: "up" | "down" | "home" | "end" | "parent") => {
      if (direction === "parent") {
        const current = flatNodes.find((fn) => fn.node.id === id);
        if (current?.parentId) {
          setFocusedId(current.parentId);
        }
        return;
      }

      if (flatNodes.length === 0) return;

      if (direction === "home") {
        setFocusedId(flatNodes[0].node.id);
        virtualizer.scrollToIndex(0);
        return;
      }
      if (direction === "end") {
        setFocusedId(flatNodes[flatNodes.length - 1].node.id);
        virtualizer.scrollToIndex(flatNodes.length - 1);
        return;
      }

      const idx = flatNodes.findIndex((fn: FlatNode) => fn.node.id === id);
      if (idx === -1) return;

      if (direction === "down" && idx < flatNodes.length - 1) {
        setFocusedId(flatNodes[idx + 1].node.id);
        virtualizer.scrollToIndex(idx + 1);
      } else if (direction === "up" && idx > 0) {
        setFocusedId(flatNodes[idx - 1].node.id);
        virtualizer.scrollToIndex(idx - 1);
      }
    },
    [flatNodes, virtualizer]
  );

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>Failed to load the table of contents.</p>
        <button onClick={() => refetch()}>Retry</button>
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
            aria-label="Clear search"
          >
            &times;
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
          Found {count} result{count === 1 ? "" : "s"} for &ldquo;
          {appliedQuery}&rdquo;
        </div>
      )}

      <nav aria-label="Table of contents">
        <ul
          ref={scrollRef}
          role="tree"
          className={styles.toc}
          style={{ position: "relative" }}
        >
          <div
            role="none"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const flatNode = flatNodes[virtualItem.index];
              return (
                <div
                  role="none"
                  key={flatNode.node.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                >
                  <TOCRow
                    flatNode={flatNode}
                    activeId={activeId}
                    focusedId={focusedId}
                    onActivate={setActiveId}
                    onToggle={toggle}
                    onFocusNode={onFocusNode}
                    onMoveFocus={onMoveFocus}
                    highlightQuery={appliedQuery || undefined}
                  />
                </div>
              );
            })}
          </div>
        </ul>
      </nav>

      {appliedQuery && !isPending && flatNodes.length === 0 && (
        <div className={styles.noResults} aria-live="polite">
          No results found for &ldquo;{appliedQuery}&rdquo;
        </div>
      )}
    </div>
  );
};
