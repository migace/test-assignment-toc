import { memo, useCallback } from "react";
import clsx from "clsx";
import type { FlatNode } from "./hooks/useFlattenedTree";
import { HighlightMatch } from "./HighlightMatch";
import { INDENT_PX, ROW_PADDING_LEFT_BASE_PX } from "./constants";
import styles from "./TOC.module.css";

interface Props {
  flatNode: FlatNode;
  activeId: string | null;
  focusedId: string | null;
  onActivate: (id: string) => void;
  onToggle: (id: string) => void;
  onFocusNode: (id: string) => void;
  onMoveFocus: (
    id: string,
    direction: "up" | "down" | "home" | "end" | "parent"
  ) => void;
  highlightQuery?: string;
}

const TOCRowComponent = ({
  flatNode,
  activeId,
  focusedId,
  onActivate,
  onToggle,
  onFocusNode,
  onMoveFocus,
  highlightQuery,
}: Props) => {
  const { node, depth, hasChildren, isExpanded, setSize, posInSet } = flatNode;
  const isActive = activeId === node.id;
  const isFocused = focusedId === node.id;

  const handleClick = useCallback(() => {
    onActivate(node.id);
    onFocusNode(node.id);
    if (hasChildren) onToggle(node.id);
  }, [node.id, hasChildren, onActivate, onFocusNode, onToggle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          if (hasChildren && !isExpanded) {
            onToggle(node.id);
          } else if (hasChildren && isExpanded) {
            onMoveFocus(node.id, "down");
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (hasChildren && isExpanded) {
            onToggle(node.id);
          } else {
            onMoveFocus(node.id, "parent");
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          onMoveFocus(node.id, "down");
          break;
        case "ArrowUp":
          e.preventDefault();
          onMoveFocus(node.id, "up");
          break;
        case "Home":
          e.preventDefault();
          onMoveFocus(node.id, "home");
          break;
        case "End":
          e.preventDefault();
          onMoveFocus(node.id, "end");
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onActivate(node.id);
          if (hasChildren) onToggle(node.id);
          break;
      }
    },
    [node.id, hasChildren, isExpanded, onActivate, onToggle, onMoveFocus]
  );

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isActive}
      aria-level={depth + 1}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      aria-label={node.title}
      tabIndex={isFocused ? 0 : -1}
      className={styles.item}
      onKeyDown={handleKeyDown}
      onFocus={() => onFocusNode(node.id)}
      ref={(el) => {
        if (isFocused && el) el.focus();
      }}
    >
      <div
        className={clsx(
          styles.header,
          isActive && styles.active,
          isExpanded && styles.expanded,
          hasChildren && styles.hasChildren
        )}
        style={{
          paddingLeft: `${depth * INDENT_PX + ROW_PADDING_LEFT_BASE_PX}px`,
        }}
        onClick={handleClick}
      >
        {hasChildren && (
          <span
            className={clsx(styles.icon, isExpanded && styles.iconExpanded)}
            aria-hidden="true"
          >
            ▶
          </span>
        )}
        <span className={styles.title}>
          {highlightQuery ? (
            <HighlightMatch text={node.title} query={highlightQuery} />
          ) : (
            node.title
          )}
        </span>
      </div>

      {isActive && isExpanded && node.anchors.length > 0 && (
        <ul className={styles.anchorList} role="group">
          {node.anchors.map((anchor) => {
            const href = anchor.anchor?.startsWith("#")
              ? `${anchor.url}${anchor.anchor}`
              : `${anchor.url}#${anchor.anchor ?? ""}`;
            return (
              <li key={anchor.id} role="none">
                <a href={href} className={styles.anchor}>
                  {anchor.title}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export const TOCRow = memo(TOCRowComponent);
