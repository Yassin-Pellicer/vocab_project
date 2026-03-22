import { useVerbHooks } from "./hook";

type TenseConjugations = Record<string, string>;
type TenseGroup = Record<string, TenseConjugations>;
type MoodGroup = Record<string, TenseGroup>;
export default function MarkdownEditor({
  route,
  name,
  isEditing,
}: {
  route: string;
  name: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}) {
  const { conjugation, setConjugation } = useVerbHooks(route, name, isEditing);

  const getMoodColor = (moodName: string) => {
    switch (moodName) {
      case "Indicative":
        return "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700";
      case "Subjunctive":
        return "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700";
      case "Imperative":
        return "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700";
      default:
        return "bg-muted/5 dark:bg-muted/10 text-foreground dark:text-foreground border-border dark:border-input";
    }
  };

  const handleConjugationChange = (
    mood: string,
    subCategory: string,
    tense: string,
    person: string,
    value: string
  ) => {
    setConjugation((prev) => {
      const currentMood = prev[mood] ?? {};
      const currentGroup = currentMood[subCategory] ?? {};
      const currentTense = currentGroup[tense] ?? {};

      return {
        ...prev,
        [mood]: {
          ...currentMood,
          [subCategory]: {
            ...currentGroup,
            [tense]: {
              ...currentTense,
              [person]: value,
            },
          },
        },
      };
    });
  };

  const renderConjugation = (
    conjugations: Record<string, string>,
    mood: string,
    subCategory: string,
    tense: string
  ) => {
    return (
      <div className="mb-2 flex flex-col gap-1">
        {Object.entries(conjugations).map(([person, form]) => (
          <div
            key={person}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 dark:hover:bg-muted/40 rounded px-4 py-1 transition-colors"
          >
            <span className="text-muted-foreground text-sm">
              {person}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={form}
                onChange={(e) =>
                  handleConjugationChange(mood, subCategory, tense, person, e.target.value)
                }
                className="h-6! text-foreground px-1!  dark:text-foreground w-full sm:w-2/3 text-sm border border-gray-400! dark:border-input bg-background dark:bg-input/20 rounded-sm"
              />
            ) : (
              <span className="h-6! text-foreground dark:text-foreground w-full sm:w-2/3 text-sm border rounded-sm px-1!  wrap-break-word">
                {form}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTenseCard = (
    tenseName: string,
    tenseValue: TenseConjugations,
    mood: string,
    subCategory: string
  ) => {
    return (
      <div className="rounded-lg border-2 shadow-sm border-slate-300 dark:border-input bg-card dark:bg-card overflow-hidden">
        <div className="font-semibold border-b border-slate-300 dark:border-input p-2 mb-2 text-foreground dark:text-foreground">
          {tenseName}
        </div>
        {renderConjugation(tenseValue, mood, subCategory, tenseName)}
      </div>
    );
  };

  const renderMoodSection = (
    moodName: string,
    moodValue: MoodGroup
  ) => {
    const allTenses: Array<{
      name: string;
      value: TenseConjugations;
      subCategory: string
    }> = [];

    Object.entries(moodValue).forEach(([subCategory, subValue]) => {
      Object.entries(subValue).forEach(([tenseName, tenseValue]) => {
        allTenses.push({ name: tenseName, value: tenseValue, subCategory });
      });
    });

    return (
      <div className="">
        <div className={`${getMoodColor(moodName)} font-bold text-md px-6 py-3 border-b-2`}>
          {moodName}
        </div>
        <div className="border-2 border-t-0 border-border dark:border-input p-4 bg-muted/5 dark:bg-muted/10">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {allTenses.map(({ name, value, subCategory }) => (
              <div key={name}>
                {renderTenseCard(name, value, moodName, subCategory)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-col items-center [scrollbar-gutter:stable] overflow-y-auto w-full px-4">
      <div
        className="flex-col items-center overflow-y-auto w-full pb-6"
      >
        <div className="flex flex-col items-center">
          <div className="max-w-200 w-full min-w-0">
          {(Object.entries(conjugation) as Array<[string, MoodGroup]>).map(
            ([section, sectionValue]) =>
              renderMoodSection(section, sectionValue)
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
