import { config } from "./endpoints/config";
import { conjugation } from "./endpoints/conjugation";
import { graph } from "./endpoints/graph";
import { markdown } from "./endpoints/markdown";
import { notes } from "./endpoints/notes";
import { translations } from "./endpoints/translations";
import { windowControls } from "./endpoints/window";
import { chat } from "./endpoints/chat";
import { auth } from "./endpoints/auth";

export const endpoints = Object.assign({}, 
  translations,
  markdown,
  conjugation,
  graph,
  config,
  notes,
  windowControls,
  chat,
  auth,
);
