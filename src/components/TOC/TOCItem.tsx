import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { type TOCNode } from "./types";
import styles from "./TOC.module.css";

interface Props {
  node: TOCNode;
  activeId: string | null;
  focusedId: string | null;
  onActivate: (id: string) => void;
  onFocusNode: (id: string) => void;
  onMoveFocus: (
    id: string,
    direction: "up" | "down" | "home" | "end" | "parent"
  ) => void;
  setSize: number;
  posInSet: number;
  highlightQuery?: string;
}

const ToCItemComponent = ({
  node,
  activeId,
  focusedId,
  onActivate,
  onFocusNode,
  onMoveFocus,
  setSize,
  posInSet,
  highlightQuery,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const isActive = activeId === node.id;
  const isFocused = focusedId === node.id;
  const hasChildren = node.children.length > 0;
  const contentId = useId();
  const shouldReduceMotion = useReducedMotion();

  const containsActive = useMemo(() => {
    if (!activeId) return false;
    const walk = (n: TOCNode): boolean =>
      n.id === activeId || n.children.some(walk);
    return walk(node);
  }, [activeId, node]);

  useEffect(() => {
    if (containsActive) setExpanded(true);
  }, [containsActive]);

  const toggle = useCallback(() => setExpanded((p) => !p), []);

  const onHeaderClick = useCallback(() => {
    if (hasChildren) toggle();
    onActivate(node.id);
    onFocusNode(node.id);
  }, [hasChildren, node.id, toggle, onActivate, onFocusNode]);

  const onHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          if (hasChildren && !expanded) {
            setExpanded(true);
          } else if (hasChildren && expanded && node.children.length > 0) {
            onFocusNode(node.children[0].id);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (hasChildren && expanded) {
            setExpanded(false);
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
          if (hasChildren) toggle();
          break;
      }
    },
    [expanded, hasChildren, node, toggle, onActivate, onFocusNode, onMoveFocus]
  );

  const contentVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: "auto", opacity: 1 },
  } as const;

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={isActive}
      aria-level={node.level + 1}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      aria-label={node.title}
      tabIndex={isFocused ? 0 : -1}
      className={styles.item}
      data-level={node.level}
      onKeyDown={onHeaderKeyDown}
      ref={(el) => {
        if (isFocused && el) el.focus();
      }}
    >
      <div
        className={clsx(
          styles.header,
          isActive && styles.active,
          expanded && styles.expanded,
          hasChildren && styles.hasChildren
        )}
        style={{ paddingLeft: `${node.level * 12}px` }}
        onClick={onHeaderClick}
      >
        {hasChildren && (
          <motion.span
            className={styles.icon}
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
            }
            aria-hidden="true"
          >
            ▶
          </motion.span>
        )}
        <span className={styles.title}>
          {highlightQuery ? (
            <HighlightMatch text={node.title} query={highlightQuery} />
          ) : (
            node.title
          )}
        </span>
      </div>

      {hasChildren && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ul
              id={contentId}
              className={styles.children}
              role="group"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { height: { duration: 0.25 }, opacity: { duration: 0.2 } }
              }
              style={{ overflow: "hidden" }}
            >
              {node.children.map((child, idx) => (
                <ToCItem
                  key={child.id}
                  node={child}
                  activeId={activeId}
                  focusedId={focusedId}
                  onActivate={onActivate}
                  onFocusNode={onFocusNode}
                  onMoveFocus={onMoveFocus}
                  setSize={node.children.length}
                  posInSet={idx + 1}
                  highlightQuery={highlightQuery}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}

      {isActive && expanded && node.anchors.length > 0 && (
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

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export const ToCItem = memo(ToCItemComponent);
