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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash, WholeWord } from "lucide-react";
import useWordModalHooks from "./hook";
import { TranslationEntry } from "@/types/translation-entry";
import DeleteWordModal from "../delete-word-modal";
import { OriginalTranslationPair } from "@/types/original-translation-pair";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditTranslationModal({ word, route, name }: { word: TranslationEntry, route: string, name: string }) {
  const {
    handlePairChange,
    addPair,
    removePair,
    addTranslationToPair,
    removeTranslationFromPair,
    addDefinitionToPair,
    removeDefinitionFromPair,
    handleSubmit,
    setFormData,
    formData
  } = useWordModalHooks({ word, route, name });

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <div className="bg-gray-200 rounded-full flex h-6 w-6 items-center justify-center cursor-pointer">
            <Pencil color="black" className="" size={14} />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[650px] overflow-y-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Translation Entry</DialogTitle>
            <DialogDescription>
              Add or edit translation pairs for this word.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col w-full gap-4">
            {formData.pair.map((pair: OriginalTranslationPair, pairIndex: number) => (
              <div key={pairIndex} className="bg-muted/10 dark:bg-muted/10 relative rounded-xl">
                <p className="font-semibold text-lg border-1 dark:border-border border-border rounded-t-xl p-2 flex items-center gap-2 text-foreground dark:text-foreground">
                  <WholeWord size={24} className="" /> Pair {pairIndex + 1}
                  {pairIndex === 0 && (
                    <span className="text-sm italic text-muted-foreground ml-4">
                      (this one will be the first one to appear in the dictionary)
                    </span>
                  )}
                </p>

                <Button
                  variant="destructive"
                  className="absolute rounded-xl p-1 top-1.5 right-1.5 !bg-transparent !text-destructive hover:!text-destructive/80 hover:!cursor-pointer dark:hover:!text-destructive/90 transition-colors text-white"
                  type="button"
                  onClick={() => removePair(pairIndex)}
                >
                  <Trash></Trash>
                </Button>

                <div className="flex flex-row pb-4 justify-between border-x-1 dark:border-border border-border gap-6 p-2 items-center">
                  <div className="flex flex-col w-full">
                    <Label
                      htmlFor="original"
                      className="mb-2 text-sm font-medium"
                    >
                      Original
                    </Label>
                    <Input
                      value={pair.original.word}
                      onChange={(e) =>
                        handlePairChange(e, pairIndex, "original.word")
                      }
                      id="original"
                      name="original"
                      placeholder="e.g., casa"
                      required
                    />
                    <div className="flex flex-row gap-2 mt-2">
                      <Select
                        value={pair.original.gender}
                        onValueChange={(val) =>
                          handlePairChange(
                            {
                              target: { value: val === "-" ? "-" : val },
                            } as any,
                            pairIndex,
                            "original.gender",
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">None</SelectItem>
                          <SelectItem value="m">Masculine</SelectItem>
                          <SelectItem value="f">Feminine</SelectItem>
                          <SelectItem value="n">Neuter</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={pair.original.number}
                        onValueChange={(val) =>
                          handlePairChange(
                            {
                              target: { value: val === "-" ? "-" : val },
                            } as any,
                            pairIndex,
                            "original.number",
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">None</SelectItem>
                          <SelectItem value="sing">Singular</SelectItem>
                          <SelectItem value="plural">Plural</SelectItem>
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
                      {pair.translations.map((t: { word: string, gender?: string, number?: string }, _tIndex: number) => (
                        <div key={_tIndex} className="flex gap-2">
                          <Input
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
                      ))}
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

                <div className="grid border-1 border-t-1 border-border border-gray-300 dark:border-border border-border p-3 gap-2 rounded-b-xl bg-muted/5 dark:bg-muted/10">
                  <Label className="font-medium">Definitions</Label>
                  {pair.definitions.map((d: string, _dIndex: number) => (
                    <div key={_dIndex} className="flex gap-2">
                      <Input
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
            ))}

            <Button
              variant="outline"
              type="button"
              className="!bg-muted/10 dark:!bg-muted/10 !text-foreground dark:!text-foreground border-1 border-gray-300 dark:border-border"
              onClick={addPair}
            >
              + Add New Pair
            </Button>
          </div>

          <Select
            value={formData.type || "noun"}
            onValueChange={(val) => setFormData({
              ...formData,
              type: val === "none" ? "" : val,
            })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="noun">Sustantivo</SelectItem>
              <SelectItem value="verb">Verbo</SelectItem>
              <SelectItem value="adjective">Adjetivo</SelectItem>
              <SelectItem value="adverb">Adverbio</SelectItem>
              <SelectItem value="preposition">Preposición</SelectItem>
              <SelectItem value="determiner">Determinante</SelectItem>
              <SelectItem value="pronoun">Pronombre</SelectItem>
              <SelectItem value="conjunction">Conjunción</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={handleSubmit}
                variant="default"
                className="!bg-primary !text-primary-foreground hover:!bg-primary/90"
              >
                Save Entry
              </Button>
            </DialogClose>
            <DeleteWordModal word={word} route={route} name={name}></DeleteWordModal>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
