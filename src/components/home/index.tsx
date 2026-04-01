import {
  Calendar,
  BookOpen,
  ArrowRight,
  Library,
  WholeWord,
  Notebook,
  Settings,
} from "lucide-react";

import WordCard from "../word-card";
import DictionaryGraph from "../knowledge-graph";
import NoteDisplay from "../notes/note-display";
import AddDictModal from "../dict/add-dict-modal";
import ConfigureDictModal from "../dict/configure-dict-modal";
import AddTranslationModal from "../dict/add-word-modal";

import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Chat } from "../chat";
import { useRef, useState, useEffect } from "react";
import { NotesContext } from "@/context/notes-context";
import LoadingOverlay from "@/components/ui/loading-overlay";

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
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState<number | undefined>(undefined);
  const typeEntries = Object.entries(dict.typeCounts ?? {}).sort((a, b) => b[1] - a[1]);
  const topTypes = typeEntries.slice(0, 5);
  const maxTypeCount = topTypes[0]?.[1] ?? 0;

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setLeftHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const bottomGap = 16;

    const measure = () => {
      rafId = null;
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 && getComputedStyle(el).display === "none") return;
      const available = window.innerHeight - rect.top - bottomGap;
      if (available > 0) {
        setChatHeight(Math.floor(available));
      }
    };

    const schedule = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(measure);
    };

    schedule();
    const scrollContainer = el.closest<HTMLElement>("[data-home-scroll]");
    scrollContainer?.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
      scrollContainer?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [leftHeight]);

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
      <div className="flex xl:flex-row flex-col gap-4 items-start ">
        <div ref={leftRef} className="flex flex-col h-fit! xl:w-2/3 w-full">
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 rounded-2xl">
            <div className="flex flex-col h-full">
              {dict.wordOfTheDay ? (
                <WordCard name={dict.id} word={dict.wordOfTheDay} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No word of the day.
                </p>
              )}
              <div className="flex justify-between flex-row w-full gap-2 mt-1 border rounded-2xl p-2">
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
                <ConfigureDictModal dictId={dict.id} dictName={dict.name}>
                  <Button type="button" variant="outline" className="flex items-center gap-1">
                    <Settings size={16} />
                    Configure
                  </Button>
                </ConfigureDictModal>
              </div>
              <h3 className="text-xs text-muted-foreground mt-3! uppercase">
                Recent words added
              </h3>
              <div className="flex flex-col gap-2 border rounded-2xl p-3 mt-2 h-full">
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
            <div className="grid grid-rows-2 gap-4">
              <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Dictionary Snapshot
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Total Words
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {dict.totalWords}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Knowledge Index
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {dict.knowledgeIndex.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <hr className="my-4!"></hr>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Word Types
                    </p>
                    {topTypes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Add words to see type distribution.
                      </p>
                    ) : (
                      topTypes.map(([type, count]) => (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate">{type}</span>
                            <span className="font-semibold text-foreground">{count}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted/40">
                            <div
                              className="h-2 rounded-full bg-primary/70"
                              style={{
                                width: `${maxTypeCount ? (count / maxTypeCount) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className=" p-3 rounded-xl border bg-linear-to-b from-transparent via-to-background/70 to-background/90">
                <p className="text-xs uppercase tracking-wide mb-1">Random Note</p>
                {dict.randomNote ? (
                  <div className="flex flex-col items-center bg-linear-to-b from-transparent via-to-background/70 to-background/90 justify-center overflow-hidden max-h-85">
                    <div className="overflow-y-hidden w-full relative">
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
          <div className="flex flex-col gap-4 h-160 md:h-160 mt-4 shadow-sm rounded-xl">
            <div className="xl:h-full border h-160 md:h-160 min-h-0 rounded-xl bg-card/60 p-1">
              <DictionaryGraph
                title={dict.name}
                name={dict.id}
                route={dict.path}
                doubleView={false}
                word=""
                showDirectToggle={false}
              />
            </div>
          </div>
        </div>
        <div
          ref={chatRef}
          className="sticky shadow-md border xl:w-1/3 xl:flex hidden w-full rounded-2xl min-h-0 top-4 flex-col overflow-hidden h-[calc(100vh-96px)] bg-card/60 max-h-screen!"
          style={chatHeight ? { height: `${chatHeight}px` } : undefined}
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

  const { dictionaryCards, totalWords, totalDictionaries, loading } = useHome();
  const { setSelectedNoteId } = NotesContext();

  if (loading) {
    return (
      <LoadingOverlay
        loading
        title="Loading"
        subtitle="Preparing your dictionaries and notes..."
        className="h-[calc(100vh-64px)]"
      >
        <div className="h-[calc(100vh-64px)]" />
      </LoadingOverlay>
    );
  }

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
    <div
      data-home-scroll
      className="flex flex-col overflow-y-auto h-[calc(100vh-64px)] gap-10 bg-background"
    >
      <div className="flex flex-col w-full">
        <div className="border-b border-border/60 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Home
              </p>
              <h2 className="mt-2 text-4xl tracking-tight font-semibold text-foreground flex items-center gap-3">
                <WholeWord size={34} strokeWidth={1.25} />
                Words of the Moment
              </h2>
              <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
                <Calendar size={14} />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total Words
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {totalWords}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Dictionaries
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {totalDictionaries}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Knowledge Index
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {((totalWords / (totalDictionaries * 15000)) * 100).toFixed(3)}%
              </p>
            </div>
          </div> */}
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
