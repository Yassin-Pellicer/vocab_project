import fetchConjugation from "./endpoints/conjugation/fetchConjugation";
import saveConjugation from "./endpoints/conjugation/saveConjugation";
import fetchMarkdown from "./endpoints/markdown/fetchMarkdown";
import saveMarkdown from "./endpoints/markdown/saveMarkdown";
import addTranslation from "./endpoints/translations/addTranslation";
import createDictionary from "./endpoints/translations/createDictionary";
import deleteTranslation from "./endpoints/translations/deleteTranslation";
import loadConfig from "./endpoints/translations/loadConfig";
import loadTranslations from "./endpoints/translations/loadTranslations";
import selectFolder from "./endpoints/translations/selectFolder";

export default function registerIpcHandlers() {
  loadTranslations();
  addTranslation();
  deleteTranslation();
  createDictionary();
  selectFolder();
  loadConfig();
  fetchMarkdown();
  saveMarkdown();
  fetchConjugation();
  saveConjugation();
}
