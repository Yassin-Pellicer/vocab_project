import fetchConjugation from "./endpoints/conjugation/fetchConjugation";
import saveConjugation from "./endpoints/conjugation/saveConjugation";
import fetchMarkdown from "./endpoints/markdown/fetchMarkdown";
import saveMarkdown from "./endpoints/markdown/saveMarkdown";
import addTranslation from "./endpoints/translations/addTranslation";
import createDictionary from "./endpoints/translations/createDictionary";
import deleteTranslation from "./endpoints/translations/deleteTranslation";
import deleteDictionary from "./endpoints/translations/deleteDictionary";
import renameDictionary from "./endpoints/translations/renameDictionary";
import loadConfig from "./endpoints/translations/loadConfig";
import loadTranslations from "./endpoints/translations/loadTranslations";
import moveDictionary from "./endpoints/translations/moveDictionary";
import selectFolder from "./endpoints/translations/selectFolder";
import fetchGraph from "./endpoints/graph/fetchGraph";
import saveGraph from "./endpoints/graph/saveGraph";
import deleteGraphEntry from "./endpoints/graph/deleteGraphEntry";
import saveUserPreferences from "./endpoints/translations/saveUserPreferences";
import loadUserPreferences from "./endpoints/translations/loadUserPreferences";

// window control handlers
import minimizeWindow from "./endpoints/window/minimize";
import maximizeWindow from "./endpoints/window/maximize";
import closeWindow from "./endpoints/window/close";

export default function registerIpcHandlers() {
  loadTranslations();
  addTranslation();
  deleteTranslation();
  createDictionary();
  moveDictionary();
  deleteDictionary();
  renameDictionary();
  selectFolder();
  loadConfig();
  fetchMarkdown();
  saveMarkdown();
  fetchConjugation();
  saveConjugation();
  fetchGraph();
  saveGraph();
  deleteGraphEntry();
  saveUserPreferences();
  loadUserPreferences();

  // register window controls last
  minimizeWindow();
  maximizeWindow();
  closeWindow();
}
