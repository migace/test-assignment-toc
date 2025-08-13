export async function fetchTOC() {
  const response = await fetch("/api/toc");
  if (!response.ok) throw new Error("Failed to load TOC");
  return response.json();
}
