import { conjugation } from "./endpoints/conjugation";
import { graph } from "./endpoints/graph";
import { markdown } from "./endpoints/markdown";
import { translations } from "./endpoints/translations";

export const endpoints = Object.assign({}, 
  translations,
  markdown,
  conjugation,
  graph,
);
