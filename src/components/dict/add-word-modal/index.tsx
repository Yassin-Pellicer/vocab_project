import { forwardRef } from "react"
import { Trash, WholeWord } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useWordModalHooks from "./hook"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AddTranslationModal = forwardRef<
  HTMLButtonElement,
  { route: string; name: string }
>(({ route, name }, ref) => {
  const {
    open,
    setOpen,
    formData,
    addPair,
    removePair,
    handlePairChange,
    addTranslationToPair,
    removeTranslationFromPair,
    addDefinitionToPair,
    removeDefinitionFromPair,
    handleSubmit,
  } = useWordModalHooks({ route, name })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <button
            ref={ref}
            onClick={() => setOpen(true)}
            className="!bg-blue-600 !rounded-lg !px-2 !flex !h-8 !items-center !justify-center !cursor-pointer"
          >
            <WholeWord color="white" size={18} />
            <p className="text-lg text-white leading-none pb-1">+</p>
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[650px] overflow-y-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Translation Entry</DialogTitle>
            <DialogDescription>
              Add one or more translation pairs for this word.
            </DialogDescription>
          </DialogHeader>

          <div className="grid divide-y gap-4">
            {formData.pair.map((pair, pairIndex) => (
              <div
                key={pairIndex}
                className=" bg-muted/20 relative"
              >
                <p className="font-semibold text-sm mb-2">
                  Pair {pairIndex + 1}
                </p>

                {/* Remove whole pair */}
                  <Button
                    variant="destructive"
                    size="xs"
                    className="absolute rounded-xl p-2 top-0 right-0"
                    type="button"
                    onClick={() => removePair(pairIndex)}
                  >
                    <Trash></Trash>
                  </Button>

                <div className="flex flex-row gap-4 items-center">
                  <div className="flex flex-col">
                    <Label htmlFor="original" className="mb-2 text-sm font-medium">
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
                        value={pair.original.gender || "none"}
                        onValueChange={(val) =>
                          handlePairChange(
                            { target: { value: val === "none" ? "" : val } } as any,
                            pairIndex,
                            "original.gender"
                          )
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="m">Masculine</SelectItem>
                          <SelectItem value="f">Feminine</SelectItem>
                          <SelectItem value="n">Neuter</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={pair.original.gender || "none"}
                        onValueChange={(val) =>
                          handlePairChange(
                            { target: { value: val === "none" ? "" : val } } as any,
                            pairIndex,
                            "original.gender"
                          )
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="m">Masculine</SelectItem>
                          <SelectItem value="f">Feminine</SelectItem>
                          <SelectItem value="n">Neuter</SelectItem>
                        </SelectContent>
                      </Select>

                    </div>
                  </div>
                  <p className="text-4xl mt-6 text-muted-foreground">⇔</p>
                  <div className="flex flex-col">
                    <Label htmlFor="translation" className="mb-2 text-sm font-medium">
                      Translation
                    </Label>
                    <div className="gap-2 flex flex-col">
                    {pair.translations.map((t, tIndex) => (
                      <div key={tIndex} className="flex gap-2">
                        <Input
                          placeholder="translation"
                          value={t.word}
                          onChange={(e) =>
                            handlePairChange(
                              e,
                              pairIndex,
                              `translations.${tIndex}.word`
                            )
                          }
                        />
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() =>
                              removeTranslationFromPair(pairIndex, tIndex)
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

                {/* DEFINITIONS */}
                <div className="grid gap-2 mt-4 mb-8">
                  <Label className="font-medium">Definitions</Label>

                  {pair.definitions.map((d, dIndex) => (
                    <div key={dIndex} className="flex gap-2">
                      <Input
                        placeholder={`Definition ${dIndex + 1}`}
                        value={d}
                        onChange={(e) =>
                          handlePairChange(
                            e,
                            pairIndex,
                            `definitions.${dIndex}`
                          )
                        }
                      />
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() =>
                            removeDefinitionFromPair(pairIndex, dIndex)
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

            {/* ADD NEW PAIR */}
            <Button
              variant="outline"
              type="button"
              className="!bg-black !text-white"
              onClick={addPair}
            >
              + Add New Pair
            </Button>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={handleSubmit}
                variant="outline"
                className="!bg-blue-600 !text-white"
              >
                Save Entry
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
})

AddTranslationModal.displayName = "AddTranslationModal"
export default AddTranslationModal
