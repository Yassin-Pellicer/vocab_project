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
import editConfig from "./endpoints/translations/editConfig";
import fetchNoteIndex from "./endpoints/notes/fetchNoteIndex";
import saveNoteIndex from "./endpoints/notes/saveNoteIndex";
import saveNotes from "./endpoints/notes/saveNotes";
import fetchNotes from "./endpoints/notes/fetchNotes";
import saveImage from "./endpoints/notes/saveImage";

import minimizeWindow from "./endpoints/window/minimize";
import maximizeWindow from "./endpoints/window/maximize";
import closeWindow from "./endpoints/window/close";
import openNewWindow from "./endpoints/window/openNewWindow";

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
  editConfig();
  fetchMarkdown();
  saveMarkdown();
  fetchConjugation();
  saveConjugation();
  fetchGraph();
  saveGraph();
  deleteGraphEntry();
  saveUserPreferences();
  loadUserPreferences();
  fetchNoteIndex();
  saveNoteIndex();
  saveNotes()
  fetchNotes();
  saveImage();

  // register window controls last
  minimizeWindow();
  maximizeWindow();
  closeWindow();
  openNewWindow();
}
