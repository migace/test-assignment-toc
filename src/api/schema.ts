import { z } from "zod";

const AnchorSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  anchor: z.string(),
  level: z.number(),
});

const PageSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().optional(),
  level: z.number(),
  parentId: z.string().optional(),
  pages: z.array(z.string()).optional(),
  tabIndex: z.number().optional(),
  doNotShowWarningLink: z.boolean().optional(),
});

export const TOCDataSchema = z.object({
  entities: z.object({
    pages: z.record(z.string(), PageSchema),
    anchors: z.record(z.string(), AnchorSchema).optional(),
  }),
  topLevelIds: z.array(z.string()),
});
