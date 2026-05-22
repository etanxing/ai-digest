export interface SourceItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  score?: number;
}

export interface Story {
  title: string;
  angle: string;
  sourceIds: number[];
}

export interface Brief {
  title: string;
  url: string;
  summary: string;
}

export interface CuratedDigest {
  features: Story[];
  briefs: Brief[];
}

export interface DigestPost {
  date: string;
  locale: "en" | "zh";
  title: string;
  storyCount: number;
  briefCount: number;
  sourceCount: number;
  content: string;
}
