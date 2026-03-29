import type {
  ChatPrompContext,
  ContextType,
} from "@/types/chat"
import type { Dictionary } from "@/types/config"
import type { TranslationEntry } from "@/types/translation-entry"

export const getStartingInfoKey = (
  startingInfo?: TranslationEntry | string | null,
): string =>
  typeof startingInfo === "string"
    ? startingInfo.trim()
    : startingInfo?.pair?.[0]?.original?.word?.trim() ?? ""

export const buildSelectionContext = (
  context?: ContextType,
): ChatPrompContext | undefined => {
  if (!context) return undefined

  if (context.type === "word") {
    return {
      description:
        "This is the word that the user has selected from their dictionary. Do with it whatever the user asks you to.",
      elements: context.content as object,
    }
  }

  if (context.type === "note") {
    return {
      description:
        "This is the note that the user has selected from their note folders. Do with it whatever the user asks you to.",
      elements: context.content as object,
    }
  }

  return undefined
}

export const buildDictionaryContext = (dictMeta?: Dictionary | null) => {
  if (!dictMeta) return undefined
  return {
    language: dictMeta.name,
    typeWords: dictMeta.typeWords ?? [],
    genders: dictMeta.genders ?? [],
    numbers: dictMeta.numbers ?? [],
    articles: dictMeta.articles ?? [],
  }
}

export const buildNotesContext = (
  selectedNoteId: string | null,
  selectedNoteContent: unknown,
  notesTree: unknown,
) => ({
  selectedId: selectedNoteId,
  selectedContent: selectedNoteId ? selectedNoteContent : undefined,
  tree: notesTree,
})

export const buildCombinedContext = ({
  selectionContext,
  dictionaryContext,
  notesContext,
}: {
  selectionContext?: ChatPrompContext
  dictionaryContext?: ReturnType<typeof buildDictionaryContext>
  notesContext?: ReturnType<typeof buildNotesContext>
}) => {
  if (!selectionContext && !dictionaryContext && !notesContext) return undefined
  return {
    ...(selectionContext ?? {}),
    ...(dictionaryContext ? { dictionary: dictionaryContext } : {}),
    ...(notesContext ? { notes: notesContext } : {}),
  }
}

