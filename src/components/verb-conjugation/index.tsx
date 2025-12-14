import { useVerbHooks } from "./hook";

const pronounMap: Record<string, string> = {
  "1s": "ich",
  "2s": "du",
  "3s": "er/sie/es",
  "1p": "wir",
  "2p": "ihr",
  "3p": "sie/Sie",
};

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
  const { conjugation, setConjugation, collapsed } = useVerbHooks(route, name, isEditing);

  const handleConjugationChange = (
    mood: string,
    subCategory: string,
    tense: string,
    person: string,
    value: string
  ) => {
    setConjugation((prev: any) => ({
      ...prev,
      [mood]: {
        ...prev[mood as keyof typeof prev],
        [subCategory]: {
          ...(prev[mood as keyof typeof prev] as any)[subCategory],
          [tense]: {
            ...((prev[mood as keyof typeof prev] as any)[subCategory] as any)[tense],
            [person]: value,
          },
        },
      },
    }));
  };

  const renderConjugation = (
    conjugations: Record<string, string>,
    mood: string,
    subCategory: string,
    tense: string
  ) => {
    return (
      <div className="mb-2">
        {Object.entries(conjugations).map(([person, form]) => (
          <div
            key={person}
            className="flex justify-between flex-wrap hover:bg-gray-50 rounded px-4 py-1"
          >
            <span className="text-gray-600 text-sm mr-2">
              {pronounMap[person] || person}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={form}
                onChange={(e) =>
                  handleConjugationChange(mood, subCategory, tense, person, e.target.value)
                }
                className="text-gray-900 w-2/3 text-sm border border-gray-300 rounded-sm px-2"
              />
            ) : (
              <span className="text-gray-900 text-sm">{form}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTenseCard = (
    tenseName: string,
    tenseValue: any,
    mood: string,
    subCategory: string
  ) => {
    return (
      <div className="rounded-lg border-1 shadow-sm border-gray-200 bg-white">
        <div className="font-semibold border-b p-2 mb-2">
          {tenseName}
        </div>
        {renderConjugation(tenseValue, mood, subCategory, tenseName)}
      </div>
    );
  };

  const renderMoodSection = (
    moodName: string,
    moodValue: Record<string, any>
  ) => {
    const allTenses: Array<{ 
      name: string; 
      value: any; 
      subCategory: string 
    }> = [];

    Object.entries(moodValue).forEach(([subCategory, subValue]) => {
      Object.entries(subValue).forEach(([tenseName, tenseValue]) => {
        allTenses.push({ name: tenseName, value: tenseValue, subCategory });
      });
    });

    return (
      <div className="">
        <div className="bg-black text-white font-bold text-md px-6 py-2">
          {moodName}
        </div>
        <div className="border-2 border-t-0 border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
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
    <div className="flex h-[calc(100vh-150px)] overflow-y-auto items-center w-full flex-col">
      <div
        className={`max-w-[830px] w-full px-4 pb-6 ${collapsed ? "hidden" : ""}`}
      >
        <div>
          {Object.entries(conjugation).map(([section, sectionValue]) =>
            renderMoodSection(section, sectionValue as Record<string, any>)
          )}
        </div>
      </div>
    </div>
  );
}