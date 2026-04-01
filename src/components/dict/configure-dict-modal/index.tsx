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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConfigureTenseModal from "@/components/dict/configure-tense-modal";
import { Settings, Sparkles, Trash, Loader2 } from "lucide-react";
import useChangeRouteModalHooks from "./hook";
import { DictionaryContext } from "@/context/dictionary-context";

interface ConfigureDictModalProps {
  dictId: string;
  dictName: string;
  children?: React.ReactNode;
}

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

function DeleteButton({
  onClick,
  disabled,
  title = "Delete",
}: DeleteButtonProps) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}>
      <Trash className="h-8 w-8 text-muted-foreground transition-colors rounded-full hover:bg-red-500 hover:text-white p-2 disabled:opacity-40" />
    </button>
  );
}

interface TypeWordSectionProps {
  typeWords: string[];
  inputValue: string;
  selectedValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
}

function TypeWordSection({
  typeWords,
  inputValue,
  selectedValue,
  onInputChange,
  onAdd,
  onSelect,
  onRemove,
}: TypeWordSectionProps) {
  return (
    <div className="grid gap-4">
      <Label>Types of word</Label>

      <div className="flex gap-2">
        <Input
          placeholder="Enter value"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={onAdd}>
          Add
        </Button>
      </div>

      <p className="text-xs">Added forms</p>
      <div className="flex gap-2">
        <Select value={selectedValue ?? ""} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {typeWords.map((word) => (
              <SelectItem key={word} value={word}>
                {word}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DeleteButton
          disabled={!selectedValue}
          onClick={() => selectedValue && onRemove(selectedValue)}
          title="Delete type"
        />
      </div>
    </div>
  );
}

interface GenderNumberSectionProps {
  genders: string[];
  numbers: string[];
  inputValue: string;
  selectedForm: string;
  selectedGender: string;
  selectedNumber: string;
  onInputChange: (value: string) => void;
  onFormChange: (value: string) => void;
  onAdd: () => void;
  onGenderSelect: (value: string) => void;
  onNumberSelect: (value: string) => void;
  onRemoveGender: (value: string) => void;
  onRemoveNumber: (value: string) => void;
}

function GenderNumberSection({
  genders,
  numbers,
  inputValue,
  selectedForm,
  selectedGender,
  selectedNumber,
  onInputChange,
  onFormChange,
  onAdd,
  onGenderSelect,
  onNumberSelect,
  onRemoveGender,
  onRemoveNumber,
}: GenderNumberSectionProps) {
  return (
    <div className="grid gap-4">
      <Label>Gender and Number Forms</Label>

      <div className="flex gap-2">
        <Input
          placeholder="Enter value"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <Select value={selectedForm} onValueChange={onFormChange}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gender">Gender</SelectItem>
            <SelectItem value="Number">Number</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={onAdd}>
          Add
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <p className="text-xs">Genders</p>
        <p className="text-xs">Numbers</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex gap-2">
          <Select value={selectedGender} onValueChange={onGenderSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DeleteButton
            onClick={() => onRemoveGender(selectedGender)}
            title="Delete gender"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedNumber} onValueChange={onNumberSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {numbers.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DeleteButton
            onClick={() => onRemoveNumber(selectedNumber)}
            title="Delete number"
          />
        </div>
      </div>
    </div>
  );
}
interface ArticlesSectionProps {
  genders: string[];
  numbers: string[];
  typeWords: string[];
  articles: Record<string, Record<string, string>>;
  selectedTypeWord: string;
  useArticles: boolean;
  onUseArticlesChange: (value: boolean) => void;
  onArticleChange: (gender: string, number: string, value: string) => void;
  onTypeWordSelect: (value: string) => void;
}

function ArticlesSection({
  genders,
  numbers,
  typeWords,
  articles,
  selectedTypeWord,
  useArticles,
  onUseArticlesChange,
  onArticleChange,
  onTypeWordSelect,
}: ArticlesSectionProps) {
  return (
    <div className="grid gap-4">
      {/* Toggle */}
      <div className="flex justify-between items-center gap-2">
        <Label>Definite article precedes nouns in Dictionary</Label>
        <Switch
          id="use-articles"
          checked={useArticles}
          onCheckedChange={onUseArticlesChange}
        />
      </div>
      <DialogDescription className="text-xs">
        When enabled, the app will automatically add the appropriate definite
        article before the type of word of your choosing based on their gender
        and number.
      </DialogDescription>

      {useArticles && (
        <div className="flex flex-col gap-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gender \ Number</TableHead>
                {numbers.map((number) => (
                  <TableHead key={number}>{number}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {genders.map((gender) => (
                <TableRow key={gender}>
                  <TableCell>{gender}</TableCell>
                  {numbers.map((number) => (
                    <TableCell key={`${gender}-${number}`}>
                      <Input
                        placeholder={`${gender} ${number}`}
                        value={articles?.[gender]?.[number] ?? ""}
                        onChange={(e) =>
                          onArticleChange(gender, number, e.target.value)
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Select value={selectedTypeWord} onValueChange={onTypeWordSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {typeWords.map((form) => (
                <SelectItem key={form} value={form}>
                  {form}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

interface TensesSectionProps {
  dictId: string;
  dictName: string;
  useTenses: boolean;
  onUseTensesChange: (value: boolean) => void;
}

function TensesSection({
  dictId,
  dictName,
  useTenses,
  onUseTensesChange,
}: TensesSectionProps) {
  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center gap-2">
        <Label>Enable Tenses</Label>
        <Switch
          id="use-tenses"
          checked={useTenses}
          onCheckedChange={onUseTensesChange}
        />
      </div>
      <DialogDescription className="text-xs">
        With tenses enabled you will be able to configure verbal tenses and
        conjugations for your dictionary. You will need to configure which type
        of word has its tenses enabled.
      </DialogDescription>
      <ConfigureTenseModal dictId={dictId} dictName={dictName}>
        <Button variant="outline" disabled={!useTenses}>
          Configure Tenses
        </Button>
      </ConfigureTenseModal>
    </div>
  );
}

export default function ConfigureDictModal({
  dictId,
  dictName,
  children,
}: ConfigureDictModalProps) {
  const hook = useChangeRouteModalHooks(dictId, dictName);
  const metadata = hook.dictionaryMetadata?.[dictId];
  const loadConfig = DictionaryContext((s) => s.loadConfig);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) void loadConfig();
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button type="button" className="flex items-center gap-2">
            <Settings size={16} />
            Configure Dictionary
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="lg:max-w-2xl md:max-w-lg sm:max-w-md w-full p-0">
        <div className="p-6 pb-2 overflow-auto max-h-[60vh]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex flex-row items-center tracking-tight mb-2">
                <p>Configure {dictName}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              If the language of your dictionary is gendered and accounts for
              singular and plural forms, you can add the appropriate options
              here. Edit the types of words, tenses, and the definite articles
              used in your dictionary.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full mt-6">
            <Button
              onClick={() => hook.handleAutomaticConfiguration()}
              variant="outline"
              className="w-full"
              disabled={hook.isGeneratingConfig}
            >
              {hook.isGeneratingConfig ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              {hook.isGeneratingConfig
                ? "Generating..."
                : "Automatic Configuration"}
            </Button>
          </div>

          <div className="grid gap-4 my-6">
            <div className="flex flex-col gap-4 border rounded-xl p-4">
              <TypeWordSection
                typeWords={metadata?.typeWords ?? []}
                inputValue={hook.inputTypeWord}
                selectedValue={hook.selectedWordType}
                onInputChange={hook.setInputTypeWord}
                onAdd={hook.addTypeWord}
                onSelect={hook.setSelectedWordType}
                onRemove={hook.removeTypeWord}
              />
            </div>

            <div className="flex flex-col gap-4 border rounded-xl p-4">
              <GenderNumberSection
                genders={metadata?.genders ?? []}
                numbers={metadata?.numbers ?? []}
                inputValue={hook.genderNumberInput}
                selectedForm={hook.selectedForm}
                selectedGender={hook.inputGender}
                selectedNumber={hook.inputNumber}
                onInputChange={hook.setGenderNumberInput}
                onFormChange={hook.setSelectedForm}
                onAdd={hook.handleFormAdd}
                onGenderSelect={hook.setInputGender}
                onNumberSelect={hook.setInputNumber}
                onRemoveGender={hook.removeGender}
                onRemoveNumber={hook.removeNumber}
              />
            </div>
            <div className="flex flex-col gap-4 border rounded-xl p-4">
              <ArticlesSection
                genders={metadata?.genders ?? []}
                numbers={metadata?.numbers ?? []}
                typeWords={metadata?.typeWords ?? []}
                articles={metadata?.articles ?? {}}
                selectedTypeWord={hook.selectTypeWordWithPrecededArticle}
                useArticles={metadata?.useArticles ?? true}
                onUseArticlesChange={hook.setUseArticles}
                onArticleChange={hook.setArticleValue}
                onTypeWordSelect={hook.setPrecededArticleTypeWord}
              />
            </div>

            <div className="flex flex-col gap-4 border rounded-xl p-4">
              <TensesSection
                dictId={dictId}
                dictName={dictName}
                useTenses={metadata?.useTenses ?? false}
                onUseTensesChange={hook.setUseTenses}
              />
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={hook.handleSaveConfiguration}
            >
              Save configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
