import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { type TOCNode } from "./types";
import styles from "./TOC.module.css";

interface Props {
  node: TOCNode;
  activeId: string | null;
  onActivate: (id: string) => void;
}

const ToCItemComponent = ({ node, activeId, onActivate }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const isActive = activeId === node.id;
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
  }, [hasChildren, node.id, toggle, onActivate]);

  const onHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowRight") {
        if (!expanded && hasChildren) {
          e.preventDefault();
          setExpanded(true);
        }
      } else if (e.key === "ArrowLeft") {
        if (expanded && hasChildren) {
          e.preventDefault();
          setExpanded(false);
        }
      }
    },
    [expanded, hasChildren]
  );

  const contentVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: "auto", opacity: 1 },
  } as const;

  return (
    <div
      className={styles.item}
      data-level={node.level}
      style={{ ["--indent" as string]: `${node.level * 12}px` }}
    >
      <button
        type="button"
        className={clsx(
          styles.header,
          isActive && styles.active,
          expanded && styles.expanded,
          hasChildren && styles.hasChildren
        )}
        style={{ paddingLeft: `calc(var(--indent, 0px))` }}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-controls={hasChildren ? contentId : undefined}
        onClick={onHeaderClick}
        onKeyDown={onHeaderKeyDown}
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
        <span className={styles.title}>{node.title}</span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
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
            {node.children.map((child) => (
              <ToCItem
                key={child.id}
                node={child}
                activeId={activeId}
                onActivate={onActivate}
              />
            ))}

            {isActive &&
              node.anchors.map((anchor) => {
                const href = anchor.anchor?.startsWith("#")
                  ? `${anchor.url}${anchor.anchor}`
                  : `${anchor.url}#${anchor.anchor ?? ""}`;
                return (
                  <a key={anchor.id} href={href} className={styles.anchor}>
                    {anchor.title}
                  </a>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ToCItem = memo(ToCItemComponent);
