import { onCLS, onFCP, onLCP, onTTFB, type Metric } from "web-vitals";

const logMetric = (metric: Metric) => {
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, Math.round(metric.value), "ms");
  }
};

export function reportWebVitals() {
  onCLS(logMetric);
  onFCP(logMetric);
  onLCP(logMetric);
  onTTFB(logMetric);
}
