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
import { Pencil, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import useWordModalHooks from "./hook";
import { TranslationEntry } from "@/types/translation-entry";
export default function EditTranslationModal({word} : {word: TranslationEntry}) {
  const {
    handleChange,
    addDefinition,
    removeDefinition,
    handleSubmit,
    formData
  } = useWordModalHooks(word);

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <div className="bg-gray-200 rounded-full flex h-6 w-6 items-center justify-center cursor-pointer">
            <Pencil color="white" className="!fill-black" size={16} />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] overflow-y-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Translation Entry</DialogTitle>
            <DialogDescription>
              Fill in the details for your new entry in the dictionary.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex flex-row gap-4 items-center">
                <div className="flex flex-col">
                  <Label htmlFor="original" className="mb-2 text-sm font-medium">
                    Original
                  </Label>
                  <Input
                    id="original"
                    name="original"
                    value={formData.original}
                    onChange={handleChange}
                    placeholder="e.g., casa"
                    required
                    className="text-2xl font-semibold text-foreground"
                  />
                </div>
                <p className="text-4xl mt-6 text-muted-foreground">⇔</p>
                <div className="flex flex-col">
                  <Label htmlFor="translation" className="mb-2 text-sm font-medium">
                    Translation
                  </Label>
                  <Input
                    id="translation"
                    name="translation"
                    value={formData.translation}
                    onChange={handleChange}
                    placeholder="e.g., house"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="type" className="mb-2">Type</Label>
                <Input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g., noun"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="mb-2">Gender</Label>
                <Input
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="e.g., f."
                />
              </div>
              <div>
                <Label htmlFor="number" className="mb-2">Number</Label>
                <Input
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="e.g., sg."
                />
              </div>
            </div>
            <div className="grid gap-2">
              {formData.definitions.map((def, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    name="definition"
                    value={def}
                    onChange={(e) => handleChange(e, index)}
                    placeholder={`Definition ${index + 1}`}
                  />
                  {formData.definitions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDefinition(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" className="!bg-black !text-white" onClick={addDefinition}>
                + Add Definition
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                placeholder="Any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} variant="outline" className="!bg-blue-600 !text-white">Save Entry</Button>
            <Button onClick={handleSubmit} variant="outline" className="!bg-red-600 !text-white"><Trash></Trash></Button>
            <DialogClose asChild>
              <Button variant="outline" >Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
