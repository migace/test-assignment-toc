import styles from "./TOC.module.css";

interface Props {
  text: string;
  query: string;
}

export const HighlightMatch = ({ text, query }: Props) => {
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
