import {
  Calendar,
  BookOpen,
  ArrowRight,
  Library,
  WholeWord,
  Notebook,
} from "lucide-react";
import WordCard from "../word-card";
import { Link } from "react-router-dom";
import useHome from "./hook";
import DictionaryGraph from "../knowledge-graph";
import { Button } from "../ui/button";
import NoteDisplay from "../notes/note-display";
import { useNotesStore } from "@/context/notes-context";

export default function Home() {
  const { dictionaryCards, loading, totalWords, totalDictionaries } = useHome();
  const { setSelectedNoteId } = useNotesStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-muted-foreground text-lg">Loading...</p>
      </div>
    );
  }

  if (!dictionaryCards || dictionaryCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
        <BookOpen size={64} className="text-muted mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          No Dictionaries Found
        </h2>
        <p className="text-muted-foreground text-center">
          Add a dictionary to get started with your vocabulary learning journey.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto h-[calc(100vh-80px)] gap-8 bg-background">
      <div className="flex flex-col w-full">
        <div className="border-b border-border p-4">
          <h2 className="text-3xl tracking-tighter font-bold text-foreground mb-3 flex items-center gap-2">
            <WholeWord size={32} strokeWidth={1.5} />
            Words of the Moment
          </h2>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 w-full divide-y divide-x border-b md:divide-y-0 md:divide-x divide-border">
          <div className="p-3">
            <p className="text-md tracking-tight font-semibold text-muted-foreground">
              Total Words
            </p>
            <p className="text-2xl font-bold text-foreground">{totalWords}</p>
          </div>
          <div className="p-3">
            <p className="text-md tracking-tight font-semibold text-muted-foreground">
              Dictionaries
            </p>
            <p className="text-2xl font-bold text-foreground">
              {totalDictionaries}
            </p>
          </div>
          <div className="p-3">
            <p className="text-md tracking-tight font-semibold text-muted-foreground">
              Knowledge
            </p>
            <p className="text-2xl font-bold text-foreground">
              {((totalWords / (totalDictionaries * 15000)) * 100).toFixed(3)}%
            </p>
          </div>
        </div>
        <div className="grid 2xl:grid-cols-2 grid-cols-1 w-full">
          {dictionaryCards.map((dict, dictIndex) => (
            <div key={dictIndex} className="flex flex-col w-full gap-4 p-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Library size={32} strokeWidth={2} />
                  {dict.name}
                </h2>
                <span className="text-xs font-mono tracking-tight text-muted-foreground">
                  {dict.totalWords} words
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-sm p-4 rounded-2xl border">
                <div className="flex flex-col min-h-0">
                  <WordCard name={dict.id} word={dict.wordOfTheDay} />
                  <div className="flex justify-between flex-row w-full gap-2 mt-1">
                    <Link
                      to={`/dictionary?name=${encodeURIComponent(dict.id)}&path=${encodeURIComponent(dict.path)}`}
                      className="w-full!"
                    >
                      <Button className="flex items-center gap-1 w-full!">
                        <BookOpen size={16} />
                        View Dictionary
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                    <Link
                      to={`/translation?name=${encodeURIComponent(dict.id)}&path=${encodeURIComponent(dict.path)}`}
                    >
                      <Button className="flex items-center gap-1">
                        Practice
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                  <h3 className="text-sm! tracking-tighter font-semibold italic text-muted-foreground mt-4!">
                    Recent words added to this dictionary
                  </h3>
                  <div className="flex flex-col gap-2 mt-1">
                    {dict.recentWords.map((word: any, wordIndex: number) => (
                      <WordCard
                        key={wordIndex}
                        word={{ ...word, definitions: undefined }}
                        route={dict.path}
                        name={dict.id}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-100 border rounded-xl lg:h-auto min-h-0">
                  <DictionaryGraph
                    title={dict.name}
                    name={dict.id}
                    route={dict.path}
                    doubleView={false}
                  />
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl border bg-gradient-to-b from-transparent via-to-background/70 to-background/90">
                <p className="text-xs uppercase tracking-wide mb-1">
                  Random Note
                </p>
                {dict.randomNote ? (
                  <div className="flex flex-col items-center bg-gradient-to-b from-transparent via-to-background/70 to-background/90 justify-center overflow-hidden max-h-[400px]">
                    <p className="text-lg text-foreground float-left w-full mt-2">
                      {dict.randomNote.title}
                    </p>
                    <div className="mt-2 overflow-y-hidden w-full relative">
                      <NoteDisplay
                        route={dict.path}
                        name={dict.id}
                        noteId={dict.randomNote.id}
                        editMode={false}
                      ></NoteDisplay>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-to-background/70 to-background/90" />
                    </div>
                    <Link
                      to={`/notes?name=${encodeURIComponent(dict.id)}&path=${encodeURIComponent(dict.path)}`}
                      onClick={() => setSelectedNoteId(dict.randomNote!.id!)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 px-2 h-8 flex items-center gap-1"
                      >
                        <Notebook size={14} />
                        Open Notes
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No notes found for this dictionary yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
