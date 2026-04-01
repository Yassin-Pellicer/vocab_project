import { useMemo, useState } from "react"
import { Editor } from "@tiptap/react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DictionaryContext } from "@/context/dictionary-context"
import type { TranslationEntry } from "@/types/translation-entry"

type DisplayMode = "link" | "card"

const EMPTY_TRANSLATIONS: TranslationEntry[] = []

const getWordLabel = (entry: TranslationEntry) => entry.pair?.[0]?.original?.word ?? "Untitled word"

const getWordTranslations = (entry: TranslationEntry) =>
  entry.pair?.[0]?.translations?.map((translation) => translation.word).join(", ") ?? ""

export default function InsertLinkedWordModal({
  editor,
  route,
  name,
  open,
  setOpen,
}: {
  editor: Editor | null
  route: string
  name: string
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const [query, setQuery] = useState("")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("link")
  const [selectedWord, setSelectedWord] = useState<TranslationEntry | null>(null)

  const storedDictionaryEntries = DictionaryContext((state) => state.dictionaries[name])
  const dictionaryEntries = storedDictionaryEntries ?? EMPTY_TRANSLATIONS

  const sortedEntries = useMemo(() => {
    return [...dictionaryEntries].sort((left, right) =>
      getWordLabel(left).localeCompare(getWordLabel(right)),
    )
  }, [dictionaryEntries])

  const filteredEntries = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) {
      return sortedEntries.slice(0, 100)
    }

    return sortedEntries
      .filter((entry) => {
        const original = getWordLabel(entry).toLowerCase()
        const translations = getWordTranslations(entry).toLowerCase()
        return original.includes(term) || translations.includes(term)
      })
      .slice(0, 100)
  }, [query, sortedEntries])

  const clearLocalState = () => {
    setQuery("")
    setSelectedWord(null)
    setDisplayMode("link")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      clearLocalState()
    }
  }

  const insertLinkedWord = () => {
    if (!editor || !selectedWord?.uuid) return

    editor.commands.insertContent({
      type: "linkedWordNote",
      attrs: {
        route,
        name,
        wordId: selectedWord.uuid,
        label: getWordLabel(selectedWord),
        displayMode,
      },
    })

    clearLocalState()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Linked Word</DialogTitle>
          <DialogDescription className="text-sm text-foreground/70">
            Select a word and choose whether to render it as a hyperlink or a word card.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search word"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={displayMode === "link" ? "default" : "outline"}
            onClick={() => setDisplayMode("link")}
          >
            Hyperlink
          </Button>
          <Button
            type="button"
            variant={displayMode === "card" ? "default" : "outline"}
            onClick={() => setDisplayMode("card")}
          >
            Word card
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-xl border border-border">
          {filteredEntries.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No words found.</p>
          ) : (
            filteredEntries.map((entry) => {
              const isSelected = selectedWord?.uuid === entry.uuid
              return (
                <button
                  key={entry.uuid ?? `${getWordLabel(entry)}-${entry.dateAdded}`}
                  type="button"
                  onClick={() => setSelectedWord(entry)}
                  className={`w-full border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-muted/30 ${
                    isSelected ? "bg-secondary/60" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{getWordLabel(entry)}</p>
                  <p className="text-xs text-muted-foreground">{getWordTranslations(entry)}</p>
                </button>
              )
            })
          )}
        </div>

        {selectedWord && (
          <div className="rounded-xl border border-border p-3">
            {displayMode === "card" ? (
              <>
                <p className="text-sm font-semibold text-foreground">
                  {getWordLabel(selectedWord)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getWordTranslations(selectedWord) || "No translations"}
                </p>
                <p className="mt-2 text-xs text-foreground/70">
                  This will be displayed as a word card in the note.
                </p>
              </>
            ) : (
              <span className="text-left text-primary underline underline-offset-2">
                {getWordLabel(selectedWord)}
              </span>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={insertLinkedWord} disabled={!selectedWord?.uuid}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
