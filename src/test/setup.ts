import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(matchers);
expect.extend(axeMatchers);

afterEach(() => {
  cleanup();
});
