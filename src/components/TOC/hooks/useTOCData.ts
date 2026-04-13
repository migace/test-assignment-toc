import { useQuery } from "@tanstack/react-query";
import { fetchTOC } from "../../../api/tocApi";
import { buildTree } from "../../../utils/buildTree";

export const useTOCData = () => {
  return useQuery({
    queryKey: ["toc"],
    queryFn: fetchTOC,
    select: (raw) => buildTree(raw),
    staleTime: 5 * 60 * 1000,
  });
};
