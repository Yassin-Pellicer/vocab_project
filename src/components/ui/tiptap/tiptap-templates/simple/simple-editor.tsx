"use client"

import { useEffect, useRef, useState } from "react"
import { Editor, EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "@/components/ui/tiptap/tiptap-ui-primitive/button"
import { Spacer } from "@/components/ui/tiptap/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/ui/tiptap/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/ui/tiptap/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/ui/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/ui/tiptap/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/ui/tiptap/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/ui/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/ui/tiptap/tiptap-node/list-node/list-node.scss"
import "@/components/ui/tiptap/tiptap-node/image-node/image-node.scss"
import "@/components/ui/tiptap/tiptap-node/heading-node/heading-node.scss"
import "@/components/ui/tiptap/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/components/ui/tiptap/tiptap-node/table-node/table-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/ui/tiptap/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/ui/tiptap/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/ui/tiptap/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/ui/tiptap/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/ui/tiptap/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/ui/tiptap/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/ui/tiptap/tiptap-ui/link-popover"
import { MarkButton } from "@/components/ui/tiptap/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/ui/tiptap/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/ui/tiptap/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/ui/tiptap/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/ui/tiptap/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/ui/tiptap/tiptap-icons/link-icon"
import { TableIcon } from "@/components/ui/tiptap/tiptap-icons/table-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/ui/tiptap/tiptap-templates/simple/simple-editor.scss"

import { DictionaryGraphNode } from "@/components/editor/nodes/dictionary-graph-node"
import { ReferenceNoteNode } from "@/components/editor/nodes/reference-note-node"
import { InsertGraphButton } from "@/components/editor/trigger/graph/insert-graph-button"
import { ReferenceNoteButton } from "@/components/editor/trigger/note/reference-note-button"
import { NotesContext } from "@/context/notes-context"
import { DictionaryContext } from "@/context/dictionary-context"
import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger } from "../../tiptap-ui-primitive/dropdown-menu"
import { ChevronDownIcon, Columns, Rows, Table2 } from "lucide-react"

const MainToolbarContent = ({
  editor,
  onHighlighterClick,
  onLinkClick,
  isMobile,
  route,
  name
}: {
  editor: Editor | null,
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean,
  route: string,
  name: string
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup className="py-0.5!">
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />

        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />

        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}

        <MarkButton type="superscript" />
        <MarkButton type="subscript" />

        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />

        <Button
          type="button"
          variant="ghost"
          tabIndex={-1}
          aria-label="Insert table"
          tooltip="Insert table"
          onClick={() => {
            editor
              ?.chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }}
          disabled={
            !editor?.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          }
        >
          <TableIcon className="tiptap-button-icon" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-1"
              tabIndex={-1}
              aria-label="Table options"
            >
              <Table2 size={15} />
              <ChevronDownIcon className="tiptap-button-dropdown-small" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-44 rounded-xl border bg-background p-1 text-foreground shadow-md"
          >
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
            >
              <Columns size={16} />
              Add column
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => editor?.chain().focus().deleteColumn().run()}
            >
              <Columns size={16} />
              Remove column
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => editor?.chain().focus().addRowAfter().run()}
            >
              <Rows size={16} />
              Add row
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => editor?.chain().focus().deleteRow().run()}
            >
              <Rows size={16} />
              Remove row
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => editor?.chain().focus().deleteTable().run()}
            >
              <Rows size={16} />
              Delete Table
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        <ImageUploadButton text="Add" />
        <InsertGraphButton editor={editor} route={route} name={name} />
        <ReferenceNoteButton editor={editor} route={route} name={name} />
      </ToolbarGroup>

      <Spacer />
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({ route, name, type, noteId, editMode = true }: { route: string, name: string, type: string, noteId?: string, editMode?: boolean }) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const isApplyingRemoteContent = useRef(false)
  const loadedNoteIdRef = useRef<string | null>(null)
  const loadedWordIdRef = useRef<string | null>(null)

  const selectedNoteIdFromStore = NotesContext((s) => s.selectedNoteId)
  const reloadTokenFromStore = NotesContext((s) => s.reloadToken)
  const setSelectedNoteContent = NotesContext((s) => s.setSelectedNoteContent)

  const selectedNoteId = noteId ?? selectedNoteIdFromStore
  const reloadToken = noteId ? 0 : reloadTokenFromStore

  const selectedWord = DictionaryContext((s) => s.selectedWord)
  const selectedWordUuid = selectedWord?.uuid ?? null

  const editor = useEditor({
    immediatelyRender: false,
    editable: editMode,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Selection,

      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      DictionaryGraphNode,
      ReferenceNoteNode,

    ],
    content: { type: "doc", content: [] },
    autofocus: false,
    onUpdate: ({ editor }) => {
      if (isApplyingRemoteContent.current) return;
      if (type === "notes" && selectedNoteId && loadedNoteIdRef.current === selectedNoteId) {
        window.api.saveNotes(route, name, selectedNoteId, editor.getJSON());
      }
      if (type === "words" && selectedWordUuid && loadedWordIdRef.current === selectedWordUuid) {
        window.api.saveMarkdown(route, name, selectedWordUuid, editor.getJSON());
      }
    },
    onCreate({ editor }) {
      editor.commands.setTextSelection(editor.state.doc.content.size);
    }
  })

  useEffect(() => {
    if (type === "notes") {
      loadedNoteIdRef.current = null
    }
    if (type === "words") {
      loadedWordIdRef.current = null
    }
  }, [type, selectedNoteId, selectedWordUuid])

  useEffect(() => {
    const loadNote = async (id: string) => {
      const data = await window.api.fetchNotes(route, name, id)

      if (editor && data) {
        isApplyingRemoteContent.current = true
        editor.commands.setContent(data, { emitUpdate: false })
        setSelectedNoteContent(data)
        loadedNoteIdRef.current = id
        queueMicrotask(() => {
          isApplyingRemoteContent.current = false
        })
      }
    }

    const loadWord = async (uuid: string) => {
      const data = await window.api.fetchMarkdown(route, name, uuid, selectedNoteId)

      if (editor && data) {
        isApplyingRemoteContent.current = true
        editor.commands.setContent(data, { emitUpdate: false })
        loadedWordIdRef.current = uuid
        queueMicrotask(() => {
          isApplyingRemoteContent.current = false
        })
      }
    }

    if (type === "notes" && selectedNoteId) void loadNote(selectedNoteId)
    if (type === "words" && selectedWordUuid) void loadWord(selectedWordUuid)

  }, [editor, name, reloadToken, route, selectedNoteId, selectedWordUuid, type])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper max-w-200!">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}
          className={`${editMode ? '' : 'hidden!'}`}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              editor={editor}
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              route={route}
              name={name}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          spellCheck={false}
          role="presentation"
          className={`${!editMode ? 'simple-editor-content p-3' : 'simple-editor-content p-4! pt-8!'}`}
        />
      </EditorContext.Provider>
    </div>
  )
}
