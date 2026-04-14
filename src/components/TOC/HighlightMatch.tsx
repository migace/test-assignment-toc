import styles from "./TOC.module.css";

interface Props {
  text: string;
  query: string;
}

export const HighlightMatch = ({ text, query }: Props) => {
  if (!query) return <>{text}</>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
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
