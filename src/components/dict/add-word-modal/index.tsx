import { forwardRef } from "react";
import type { ReactNode } from "react";
import { Trash, WholeWord } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useWordModalHooks from "./hook";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OriginalTranslationPair } from "@/types/original-translation-pair";
import { TranslationEntry } from "@/types/translation-entry";
import { useConfigStore } from "@/context/dictionary-context";

const buildDefaultEntry = (): TranslationEntry => {
  const emptyPair: OriginalTranslationPair = {
    original: {
      word: "",
      gender: "",
      number: "",
    },
    translations: [
      {
        word: "",
        gender: "",
        number: "",
      },
    ],
    definitions: [],
  };

  return {
    pair: [emptyPair],
    dateAdded: new Date().toISOString().split("T")[0],
    type: "noun",
  };
};

const normalizeEntry = (entry?: TranslationEntry): TranslationEntry => {
  const fallback = buildDefaultEntry();
  if (!entry) return fallback;

  const pairs =
    entry.pair && entry.pair.length > 0 ? entry.pair : fallback.pair;
  const normalizedPairs = pairs.map((pair) => ({
    original: {
      word: pair.original?.word ?? "",
      gender: pair.original?.gender ?? "",
      number: pair.original?.number ?? "",
    },
    translations:
      pair.translations && pair.translations.length > 0
        ? pair.translations.map((t) => ({
            word: t.word ?? "",
            gender: t.gender ?? "",
            number: t.number ?? "",
          }))
        : [{ word: "", gender: "", number: "" }],
    definitions: Array.isArray(pair.definitions) ? pair.definitions : [],
  }));

  return {
    ...fallback,
    ...entry,
    pair: normalizedPairs,
    dateAdded: entry.dateAdded ?? fallback.dateAdded,
    type: entry.type ?? fallback.type,
  };
};

const AddTranslationModal = forwardRef<
  HTMLButtonElement,
  {
    route: string;
    name: string;
    trigger?: ReactNode;
    prefill?: TranslationEntry;
  }
>(({ route, name, trigger, prefill }, ref) => {
  const {
    open,
    setOpen,
    formData,
    addPair,
    removePair,
    handlePairChange,
    setPairField,
    addTranslationToPair,
    removeTranslationFromPair,
    addDefinitionToPair,
    removeDefinitionFromPair,
    handleSubmit,
    setFormData,
  } = useWordModalHooks({ route, name });
  const { dictionaryMetadata } = useConfigStore();
  const dict = dictionaryMetadata?.[name] ?? {};

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && prefill) {
      setFormData(normalizeEntry(prefill));
    }
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div>
        <DialogTrigger asChild>
          {trigger ?? (
            <button
              ref={ref}
              onClick={() => setOpen(true)}
              type="button"
              className="bg-primary! rounded-xl! px-2! py-4.5 flex! h-8! items-center! justify-center! cursor-pointer! hover:bg-primary/90! transition-colors"
            >
              <WholeWord className="text-primary-foreground" size={18} />
              <p className="text-lg text-primary-foreground leading-none pb-1">
                +
              </p>
            </button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-162.5 overflow-y-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Translation Entry</DialogTitle>
            <DialogDescription>
              Add one or more translation pairs for this word.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col w-full gap-4">
            {formData.pair.map(
              (pair: OriginalTranslationPair, pairIndex: number) => (
                <div
                  key={pairIndex}
                  className="bg-muted/10 dark:bg-muted/10 relative rounded-xl"
                >
                  <p className="font-semibold text-lg border dark:border-border border-border rounded-t-xl p-2 flex items-center gap-2 text-foreground dark:text-foreground">
                    <WholeWord size={24} className="" /> Pair {pairIndex + 1}
                    {pairIndex === 0 && (
                      <span className="text-sm italic text-muted-foreground ml-4">
                        (this one will be the first one to appear in the
                        dictionary)
                      </span>
                    )}
                  </p>

                  <Button
                    variant="destructive"
                    className="absolute rounded-xl p-1 top-1.5 right-1.5 bg-transparent! text-destructive! hover:text-destructive/80! hover:cursor-pointer! dark:hover:text-destructive/90! transition-colors"
                    type="button"
                    onClick={() => removePair(pairIndex)}
                  >
                    <Trash></Trash>
                  </Button>

                  <div className="flex flex-row pb-4 justify-between border-x dark:border-border border-border gap-6 p-2 items-center">
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="original"
                        className="mb-2 text-sm font-medium"
                      >
                        Original
                      </Label>
                      <Input
                        className="border-muted-foreground/15 bg-background"
                        value={pair.original.word}
                        onChange={(e) =>
                          handlePairChange(e, pairIndex, "original.word")
                        }
                        id="original"
                        name="original"
                        placeholder="e.g., casa"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Select
                          value={pair.original.gender}
                          onValueChange={(val) =>
                            setPairField(val, pairIndex, "original.gender")
                          }
                        >
                          <SelectTrigger className="border-muted-foreground/20 bg-background w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={"-"}>-</SelectItem>
                            {dict.genders?.map((gender: string) => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={pair.original.number}
                          onValueChange={(val) =>
                            setPairField(val, pairIndex, "original.number")
                          }
                        >
                          <SelectTrigger className="border-muted-foreground/20 bg-background w-full">
                            <SelectValue placeholder="Select number" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={"-"}>-</SelectItem>
                            {dict.numbers?.map((number: string) => (
                              <SelectItem key={number} value={number}>
                                {number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-4xl mt-6 text-muted-foreground">⇔</p>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="translation"
                        className="mb-2 text-sm font-medium"
                      >
                        Translation
                      </Label>
                      <div className="gap-2 flex flex-col">
                        {pair.translations.map(
                          (
                            t: {
                              word: string;
                              gender?: string;
                              number?: string;
                            },
                            _tIndex: number,
                          ) => (
                            <div key={_tIndex} className="flex gap-2">
                              <Input
                                className="border-muted-foreground/15 bg-background"
                                placeholder="translation"
                                value={t.word}
                                onChange={(e) =>
                                  handlePairChange(
                                    e,
                                    pairIndex,
                                    `translations.${_tIndex}.word`,
                                  )
                                }
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={() =>
                                  removeTranslationFromPair(pairIndex, _tIndex)
                                }
                              >
                                ✕
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                      <Button
                        variant="outline"
                        type="button"
                        className="mt-2 w-full"
                        onClick={() => addTranslationToPair(pairIndex)}
                      >
                        + Add Translation
                      </Button>
                    </div>
                  </div>

                  <div className="grid border border-t p-3 gap-2 rounded-b-xl">
                    <Label className="font-medium">Definitions</Label>
                    {pair.definitions.map((d: string, _dIndex: number) => (
                      <div key={_dIndex} className="flex gap-2">
                        <Input
                          className="border-muted-foreground/20 bg-background text-sm"
                          placeholder={`Definition ${_dIndex + 1}`}
                          value={d}
                          onChange={(e) =>
                            handlePairChange(
                              e,
                              pairIndex,
                              `definitions.${_dIndex}`,
                            )
                          }
                        />
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() =>
                            removeDefinitionFromPair(pairIndex, _dIndex)
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addDefinitionToPair(pairIndex)}
                    >
                      + Add Definition
                    </Button>
                  </div>
                </div>
              ),
            )}

            <Button
              variant="outline"
              type="button"
              className="bg-muted/10! dark:bg-muted/10! text-foreground! dark:text-foreground! border border-gray-300 dark:border-border"
              onClick={addPair}
            >
              + Add New Pair
            </Button>
          </div>

          <Select
            value={formData.type || "noun"}
            onValueChange={(val) =>
              setFormData({
                ...formData,
                type: val === "none" ? "" : val,
              })
            }
          >
            <SelectTrigger className="border-muted-foreground/20 bg-background w-full">
              <SelectValue placeholder={dict.typeWords?.[0] || "Select type"} />
            </SelectTrigger>
            <SelectContent>
              {dict.typeWords?.map((typeWord: string) => (
                <SelectItem key={typeWord} value={typeWord}>
                  {typeWord}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={handleSubmit}
                type="button"
                variant="default"
                className="bg-primary! text-primary-foreground! hover:bg-primary/90!"
              >
                Save Entry
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
});

AddTranslationModal.displayName = "AddTranslationModal";
export default AddTranslationModal;
