import { config } from "./endpoints/config";
import { conjugation } from "./endpoints/conjugation";
import { graph } from "./endpoints/graph";
import { markdown } from "./endpoints/markdown";
import { translations } from "./endpoints/translations";
import { windowControls } from "./endpoints/window";

export const endpoints = Object.assign({}, 
  translations,
  markdown,
  conjugation,
  graph,
  config,
  windowControls,
);
