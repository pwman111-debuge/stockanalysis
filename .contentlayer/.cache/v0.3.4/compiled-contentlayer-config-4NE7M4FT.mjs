// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
var MarketAnalysis = defineDocumentType(() => ({
  name: "MarketAnalysis",
  filePathPattern: `market-analysis/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    category: { type: "enum", options: ["daily", "weekly", "monthly", "special"], required: true },
    tags: { type: "list", of: { type: "string" } },
    summary: { type: "string", required: true },
    thumbnail: { type: "string" }
  },
  computedFields: {
    url: { type: "string", resolve: (post) => `/market/${post._raw.flattenedPath.split("/").pop()}` }
  }
}));
var StockPick = defineDocumentType(() => ({
  name: "StockPick",
  filePathPattern: `picks/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    ticker: { type: "string", required: true },
    market: { type: "enum", options: ["KOSPI", "KOSDAQ", "KONEX"], required: true },
    term: { type: "enum", options: ["short", "mid", "long"], required: true },
    date: { type: "date", required: true },
    updatedAt: { type: "date" },
    status: { type: "enum", options: ["active", "closed", "watching"], default: "active" },
    currentPrice: { type: "number", required: true },
    targetPrice: { type: "number", required: true },
    stopLoss: { type: "number", required: true },
    expectedReturn: { type: "string" },
    holdingPeriod: { type: "string" },
    tags: { type: "list", of: { type: "string" } },
    summary: { type: "string", required: true },
    thumbnail: { type: "string" }
  },
  computedFields: {
    url: { type: "string", resolve: (post) => `/picks/${post.term}/${post._raw.flattenedPath.split("/").pop()}` }
  }
}));
var StockReport = defineDocumentType(() => ({
  name: "StockReport",
  filePathPattern: `stock-reports/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    ticker: { type: "string", required: true },
    market: { type: "enum", options: ["KOSPI", "KOSDAQ"], required: true },
    date: { type: "date", required: true },
    updatedAt: { type: "date" },
    reportType: { type: "enum", options: ["fundamental", "technical", "sector", "esg"], required: true },
    rating: { type: "enum", options: ["buy", "hold", "sell", "not-rated"], required: true },
    currentPrice: { type: "number", required: true },
    targetPrice: { type: "number", required: true },
    priceUpside: { type: "string" },
    sector: { type: "string" },
    marketCap: { type: "string" },
    tags: { type: "list", of: { type: "string" } },
    summary: { type: "string", required: true }
  },
  computedFields: {
    url: { type: "string", resolve: (post) => `/analysis/${post._raw.flattenedPath.split("/").pop()}` }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [MarketAnalysis, StockPick, StockReport]
});
export {
  MarketAnalysis,
  StockPick,
  StockReport,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-4NE7M4FT.mjs.map
