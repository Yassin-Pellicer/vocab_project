import { useState } from "react"
import { Editor } from "@tiptap/react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DialogDescription } from "@radix-ui/react-dialog"
import KnowledgeGraph from "@/components/knowledge-graph"
import { Switch } from "@/components/ui/switch"
import { TranslationEntry } from "@/types/translation-entry"

export default function GraphInsertModal({
  editor,
  route,
  name,
  open,
  setOpen,
  doubleView = true,
}: {
  editor: Editor | null
  route: string
  name: string
  open: boolean
  setOpen: (v: boolean) => void
  doubleView?: boolean
}) {
  const [word, setWord] = useState("")
  const [directOnly, setDirectOnly] = useState(false)
  const [selectedGraphWord, setSelectedGraphWord] = useState<TranslationEntry | null>(null)

  const insertGraph = () => {
    if (!editor || !selectedGraphWord?.uuid) return

    editor.commands.insertContent({
      type: "dictionaryGraph",
      attrs: {
        route,
        name,
        title: "",
        doubleView,
        word: selectedGraphWord.pair?.[0]?.original?.word ?? word,
        wordId: selectedGraphWord.uuid,
        directOnly,
      },
    })

    setWord("")
    setSelectedGraphWord(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Graph</DialogTitle>
          <DialogDescription className="text-foreground/70 text-sm">
            Select a word of your dictionary to display its related words in a Graph Frame.
          </DialogDescription>
        </DialogHeader>

        <div className="border h-100 w-full rounded-lg">
          <KnowledgeGraph
            route={route}
            name={name}
            title={""}
            doubleView={doubleView}
            word={word}
            showDirectToggle={false}
            showBottomSelector={false}
            showGoBackButton={true}
            autoSelectRandomWord={false}
            selectionScope="local"
            initialWordId={selectedGraphWord?.uuid}
            directOnlyOverride={directOnly}
            onWordSelected={(selected) => {
              setSelectedGraphWord(selected)
              setWord(selected.pair?.[0]?.original?.word ?? "")
            }}
            onSelectionCleared={() => {
              setSelectedGraphWord(null)
              setWord("")
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm text-foreground/80">
            Direct relations only
          </label>
          <Switch
            checked={directOnly}
            onCheckedChange={(value) => setDirectOnly(Boolean(value))}
          />
        </div>
        <Input
          placeholder="Word to search"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={insertGraph} disabled={!selectedGraphWord?.uuid}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
