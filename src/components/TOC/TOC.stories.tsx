import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { ToC } from "./TOC";
import type { TOCData } from "./types";

const smallMockData: TOCData = {
  entities: {
    pages: {
      "getting-started": {
        id: "getting-started",
        title: "Getting Started",
        url: "getting-started.html",
        level: 0,
        pages: ["installation", "configuration"],
      },
      installation: {
        id: "installation",
        title: "Installation",
        url: "installation.html",
        level: 1,
        parentId: "getting-started",
      },
      configuration: {
        id: "configuration",
        title: "Configuration",
        url: "configuration.html",
        level: 1,
        parentId: "getting-started",
        pages: ["env-variables"],
      },
      "env-variables": {
        id: "env-variables",
        title: "Environment Variables",
        url: "env-variables.html",
        level: 2,
        parentId: "configuration",
      },
      "advanced-topics": {
        id: "advanced-topics",
        title: "Advanced Topics",
        url: "advanced-topics.html",
        level: 0,
        pages: ["plugins", "api-reference"],
      },
      plugins: {
        id: "plugins",
        title: "Plugins",
        url: "plugins.html",
        level: 1,
        parentId: "advanced-topics",
      },
      "api-reference": {
        id: "api-reference",
        title: "API Reference",
        url: "api-reference.html",
        level: 1,
        parentId: "advanced-topics",
      },
      faq: {
        id: "faq",
        title: "FAQ",
        url: "faq.html",
        level: 0,
      },
    },
    anchors: {},
  },
  topLevelIds: ["getting-started", "advanced-topics", "faq"],
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof ToC> = {
  title: "Components/TOC",
  component: ToC,
  decorators: [
    (Story) => {
      queryClient.clear();
      return (
        <QueryClientProvider client={queryClient}>
          <div style={{ height: "100vh" }}>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ToC>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [http.get("/api/toc", () => HttpResponse.json(smallMockData))],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/toc", async () => {
          await new Promise(() => {});
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/toc", () =>
          HttpResponse.json({ error: "Server error" }, { status: 500 })
        ),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/toc", () =>
          HttpResponse.json({
            entities: { pages: {}, anchors: {} },
            topLevelIds: [],
          })
        ),
      ],
    },
  },
};
