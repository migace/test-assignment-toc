export interface Anchor {
  id: string;
  title: string;
  url: string;
  anchor: string;
  level: number;
}

export interface Page {
  id: string;
  title: string;
  url: string;
  level: number;
  parentId?: string;
  pages?: string[];
  tabIndex?: number;
  doNotShowWarningLink?: boolean;
}

export interface TOCData {
  entities: {
    pages: Record<string, Page>;
    anchors: Record<string, Anchor>;
  };
  topLevelIds: string[];
}

export interface TOCNode extends Page {
  children: TOCNode[];
  anchors: Anchor[];
}
