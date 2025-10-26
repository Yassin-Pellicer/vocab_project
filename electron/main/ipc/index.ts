import addTranslation from "./endpoints/addTranslation";
import deleteTranslation from "./endpoints/deleteTranslation";
import loadTranslations from "./endpoints/loadTranslations";

export default function registerIpcHandlers() {
  loadTranslations();
  addTranslation();
  deleteTranslation();
}
