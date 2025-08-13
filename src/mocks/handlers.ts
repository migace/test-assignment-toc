import { http, HttpResponse } from "msw";

import tocJsonData from "./HelpTOC.json";

export const handlers = [
  http.get("/api/toc", () => {
    return HttpResponse.json(tocJsonData);
  }),
];
