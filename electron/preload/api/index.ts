import { conjugation } from "./endpoints/conjugation";
import { markdown } from "./endpoints/markdown";
import { translations } from "./endpoints/translations";

export const endpoints = Object.assign({}, 
  translations,
  markdown,
  conjugation
);
