import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useChangeRouteModalHooks from "./hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "@/components/ui/table";
import ConfigureTenseModal from "@/components/dict/configure-tense-modal";
import { Settings, Trash } from "lucide-react";

interface ConfigureDictModalProps {
  dictId: string;
  dictName: string;
  children: React.ReactNode;
}

export default function ConfigureDictModal({
  dictId,
  dictName,
  children,
}: ConfigureDictModalProps) {
  const hook = useChangeRouteModalHooks(dictId);

  const metadata = hook.dictionaryMetadata?.[dictId];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-full p-0">
        <div className="p-6 pb-2 overflow-auto max-h-[75vh]">
          <DialogHeader>
            <DialogTitle>
              <Settings className="h-4 w-4 inline-block mr-2" />
              Configure <b>{dictName}</b>
            </DialogTitle>
            <DialogDescription>
              If the language of your dictionary is gendered and accounts for
              singular and plural forms, you can add the appropriate options
              here. Edit the types of words, tenses and the definite articles
              used in your dictionary.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className="grid gap-4">
              <Label>Types of word</Label>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter value"
                  value={hook.inputTypeWord}
                  onChange={(e) => hook.setInputTypeWord(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={hook.addTypeWord}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              <p className="text-xs mb-[-10px]">Added forms</p>
              <div className="flex flex-row gap-2">
                <Select
                  value={hook.selectedWordType ?? ""}
                  onValueChange={hook.setSelectedWordType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>

                  <SelectContent>
                    {metadata?.typeWords?.map((word: string) => (
                      <SelectItem key={word} value={word}>
                        {word}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <button
                  type="button"
                  disabled={!hook.selectedWordType}
                  onClick={() =>
                    hook.selectedWordType &&
                    hook.removeTypeWord(hook.selectedWordType)
                  }
                  title="Delete type"
                >
                  <Trash className="h-8 w-8 text-muted-foreground transition-colors rounded-full hover:bg-red-500 hover:text-white p-2 disabled:opacity-40" />
                </button>
              </div>

              <Label>Gender and Number Forms</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter value"
                  value={hook.genderNumberInput}
                  onChange={(e) => hook.setGenderNumberInput(e.target.value)}
                />
                <Select
                  value={hook.selectedForm}
                  onValueChange={hook.setSelectedForm}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gender">Gender</SelectItem>
                    <SelectItem value="Number">Number</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={hook.handleFormAdd}
                >
                  Add
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-xs mb-[-10px]">Genders</p>
                <p className="text-xs mb-[-10px]">Numbers</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-row gap-2">
                  <Select
                    value={hook.inputGender}
                    onValueChange={hook.setInputGender}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.genders?.map((form: string) => (
                        <SelectItem key={form} value={form}>
                          {form}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => {
                      hook.removeGender(hook.inputGender);
                    }}
                    title="Delete form"
                  >
                    <Trash className="h-8 w-8 text-muted-foreground transition-colors rounded-full hover:bg-red-500 hover:text-white p-2" />
                  </button>
                </div>
                <div className="flex flex-row gap-2">
                  <Select
                    value={hook.inputNumber}
                    onValueChange={hook.setInputNumber}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.numbers?.map((form: string) => (
                        <SelectItem key={form} value={form}>
                          {form}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => {
                      hook.removeNumber(hook.inputNumber);
                    }}
                    title="Delete form"
                  >
                    <Trash className="h-8 w-8 text-muted-foreground transition-colors rounded-full hover:bg-red-500 hover:text-white p-2" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2">
                <p className="text-sm">
                  Definite article precedes nouns in Dictionary
                </p>
                <Switch
                  id="use-articles"
                  checked={metadata?.useArticles ?? true}
                  onCheckedChange={hook.setUseArticles}
                />
              </div>
              <DialogDescription className="text-xs">
                When enabled, the app will automatically add the appropriate
                definite article before nouns based on their gender and number.
              </DialogDescription>
              {metadata?.useArticles && (
                <div className="flex flex-col gap-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gender\Number</TableHead>

                        {metadata?.numbers?.map((number: string) => (
                          <TableHead key={number}>{number}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metadata?.genders?.map((gender: string) => (
                        <TableRow key={gender}>
                          <TableCell>{gender}</TableCell>

                          {metadata?.numbers?.map((number: string) => (
                            <TableCell key={`${gender}-${number}`}>
                              <Input
                                placeholder={`${gender} ${number}`}
                                value={
                                  metadata?.articles?.[gender]?.[number] || ""
                                }
                                onChange={(e) =>
                                  hook.setArticleValue(
                                    gender,
                                    number,
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Select
                    value={hook.selectTypeWordWithPrecededArticle}
                    onValueChange={hook.setPrecededArticleTypeWord}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.typeWords?.map((form: string) => (
                        <SelectItem key={form} value={form}>
                          {form}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-between items-center gap-2">
                <p className="text-sm">Enable Tenses</p>
                <Switch
                  id="use-tenses"
                  checked={metadata?.useTenses ?? false}
                  onCheckedChange={hook.setUseTenses}
                />
              </div>
              <DialogDescription className="text-xs">
                With tenses enabled you will be able to configure verbal tenses
                and conjugations for your dictionary. You will need to configure
                which type of word has its tenses enabled.
              </DialogDescription>
              <ConfigureTenseModal dictId={dictId} dictName={dictName}>
                <Button disabled={!metadata?.useTenses}>
                  Configure Tenses
                </Button>
              </ConfigureTenseModal>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
