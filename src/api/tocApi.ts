import type { TOCData } from "../components/TOC/types";
import { TOCDataSchema } from "./schema";

export async function fetchTOC(): Promise<TOCData> {
  const response = await fetch("/api/toc");
  if (!response.ok) throw new Error("Failed to load TOC");

  const data: unknown = await response.json();
  return TOCDataSchema.parse(data);
}
