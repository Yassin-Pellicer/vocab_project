import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
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

import useEditWordModalHooks from "./hook";
import DeleteWordModal from "../delete-word-modal";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash, WholeWord } from "lucide-react";
import { TranslationEntry } from "@/types/translation-entry";
import { OriginalTranslationPair } from "@/types/original-translation-pair";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DictionaryContext } from "@/context/dictionary-context";

export default function EditTranslationModal({
  word,
  route,
  name,
  trigger,
}: {
  word: TranslationEntry;
  route: string;
  name: string;
  trigger?: ReactNode;
}) {
  const {
    handlePairChange,
    setPairField,
    addPair,
    removePair,
    addTranslationToPair,
    removeTranslationFromPair,
    addDefinitionToPair,
    removeDefinitionFromPair,
    handleSubmit,
    setFormData,
    formData,
  } = useEditWordModalHooks({ word, route, name });

  const { dictionaryMetadata } = DictionaryContext();
  const dict = dictionaryMetadata?.[name] ?? {};

  return (
    <Dialog>
      <div>
        <DialogTrigger asChild>
          {trigger ?? (
            <div className="bg-accent rounded-full flex h-6 w-6 items-center justify-center cursor-pointer">
              <Pencil className="text-background/90!" size={14} />
            </div>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-162.5 overflow-y-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Translation Entry</DialogTitle>
            <DialogDescription>
              Add or edit translation pairs for this word.
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
            <DeleteWordModal
              word={word}
              route={route}
              name={name}
            ></DeleteWordModal>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
}
