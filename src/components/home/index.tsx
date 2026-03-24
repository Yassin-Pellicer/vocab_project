import {
  Calendar,
  BookOpen,
  ArrowRight,
  Library,
  WholeWord,
  Notebook,
} from "lucide-react";

import WordCard from "../word-card";
import DictionaryGraph from "../knowledge-graph";
import NoteDisplay from "../notes/note-display";
import AddDictModal from "../dict/add-dict-modal";
import ConfigureDictModal from "../dict/configure-dict-modal";
import AddTranslationModal from "../dict/add-word-modal";
import Sketchboard from "../sketchboard";

import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Chat } from "../chat";
import { useRef, useState, useEffect } from "react";
import { NotesContext } from "@/context/notes-context";

import useHome from "./hook";

function DictRow({
  dict,
  setSelectedNoteId,
}: {
  dict: ReturnType<typeof useHome>["dictionaryCards"][number];
  setSelectedNoteId: (id: string) => void;
}) {

  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setLeftHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Library size={32} strokeWidth={2} />
          {dict.name}
        </h2>
        <span className="text-xs font-mono tracking-tight text-muted-foreground">
          {dict.totalWords} words
        </span>
      </div>
      <div className="grid lg:grid-cols-[65%_35%] grid-cols-1 gap-4 items-start ">
        <div ref={leftRef} className="flex flex-col h-fit!">
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 shadow-sm p-4 rounded-2xl border">
            <div className="flex flex-col">
              {dict.wordOfTheDay ? (
                <WordCard name={dict.id} word={dict.wordOfTheDay} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No word of the day.
                </p>
              )}
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
              </div>
              <h3 className="text-sm! tracking-tighter font-semibold italic text-muted-foreground mt-4!">
                Recent words added to this dictionary
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {dict.recentWords.map((word) => (
                  <WordCard
                    key={word.uuid ?? `${dict.id}-${word.dateAdded}`}
                    word={word}
                    route={dict.path}
                    name={dict.id}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Dictionary Snapshot
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total words</span>
                    <span className="font-semibold text-foreground">
                      {dict.totalWords}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recent additions</span>
                    <span className="font-semibold text-foreground">
                      {dict.recentWords.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Word of the day</span>
                    <span className="font-semibold text-foreground truncate max-w-40 text-right">
                      {dict.wordOfTheDay?.pair[0]?.original?.word ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Random note</span>
                    <span className="font-semibold text-foreground truncate max-w-40 text-right">
                      {dict.randomNote?.title ?? "—"}
                    </span>
                  </div>
                </div>
                <hr className="my-4!"></hr>
                <Sketchboard storageKey={`sketchboard:${dict.id}`} />
              </div>
              <div className="mt-4 text-xs text-muted-foreground italic">
                Tip: open the graph below to explore links between words.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="h-full border rounded-xl 2xl:h-auto min-h-0">
              <DictionaryGraph
                title={dict.name}
                name={dict.id}
                route={dict.path}
                doubleView={false}
                word=""
                showDirectToggle={false}
              />
            </div>
            <div className=" p-3 rounded-xl border bg-linear-to-b from-transparent via-to-background/70 to-background/90 shadow-md">
              <p className="text-xs uppercase tracking-wide mb-1">Random Note</p>
              {dict.randomNote ? (
                <div className="flex flex-col items-center bg-linear-to-b from-transparent via-to-background/70 to-background/90 justify-center overflow-hidden max-h-100">
                  <p className="text-lg text-foreground float-left w-full mt-2">
                    {dict.randomNote.title}
                  </p>
                  <div className="mt-2 overflow-y-hidden w-full relative">
                    <NoteDisplay
                      route={dict.path}
                      name={dict.id}
                      noteId={dict.randomNote.id}
                      editMode={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-to-background/70 to-background/90" />
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

        </div>

        <div
          style={{ height: leftHeight ? `${leftHeight}px` : undefined }}
          className="shadow-md rounded-2xl"
        >
          <Chat
            conversationScope="home"
            route={dict.path}
            name={dict.id}
            startingInfo={
              "This is the word of the day: " +
              dict.wordOfTheDay?.pair[0].original.word + ". "
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {

  const { dictionaryCards, totalWords, totalDictionaries } = useHome();
  const { setSelectedNoteId } = NotesContext();

  if (
    totalWords <= 0 &&
    totalDictionaries === 1 &&
    dictionaryCards.length === 1
  ) {

    const dict = dictionaryCards[0];

    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] px-4">
        <div className="flex flex-col w-100">
          <h2 className="flex wrap flex-row gap-4 text-2xl! font-bold text-foreground mb-2">
            <BookOpen size={32} className="shrink-0" /> Great!
          </h2>
          <p className="text-sm! text-muted-foreground mb-4">
            You've added your dictionary! Now we'd recommend you do some
            configurations first in order to bring the best out of your learning
            experience.
          </p>
          <ConfigureDictModal dictId={dict.id} dictName={dict.name} />
          <div className="flex flex-row mt-12 mb-4 items-center">
            <p className="text-sm! text-muted-foreground">
              Once you've configured your dictionary you can try and add your{" "}
              <b>first word!</b>
            </p>
            <AddTranslationModal route={dict.path} name={dict.id} />
          </div>
        </div>
      </div>
    );
  }

  if (
    !dictionaryCards || 
    dictionaryCards.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] px-4">
        <div className="flex flex-col w-100">
          <h2 className="flex wrap flex-row gap-4 text-2xl! font-bold text-foreground mb-2">
            <BookOpen size={32} className="shrink-0" /> No Dictionaries Found
          </h2>
          <p className="text-sm! text-muted-foreground mb-4">
            Add a dictionary to get started with your vocabulary learning
            journey. Follow the recommendations once created to make the best
            use of it!
          </p>
          <AddDictModal />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto h-[calc(100vh-64px)] gap-8 bg-background">
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
        <div className="grid lg:grid-cols-1 grid-cols-1 w-full">
          {dictionaryCards.map((dict, dictIndex) => (
            <DictRow
              key={dictIndex}
              dict={dict}
              setSelectedNoteId={setSelectedNoteId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
