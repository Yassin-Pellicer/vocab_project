import { BookOpen, Plus } from "lucide-react";

export default function DictionariesSection() {
  const dictionaries = [
    { name: "Spanish Vocabulary", words: 150, lastUsed: "Today" },
    { name: "French Basics", words: 89, lastUsed: "2 days ago" },
    { name: "German Verbs", words: 234, lastUsed: "1 week ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Dictionaries</h2>
        <p className="text-sm text-muted-foreground">
          Manage your vocabulary dictionaries
        </p>
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-accent/50 transition-colors text-sm text-muted-foreground">
        <Plus className="h-4 w-4" />
        Create New Dictionary
      </button>

      <div className="space-y-3">
        {dictionaries.map((dict, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{dict.name}</div>
                <div className="text-xs text-muted-foreground">
                  {dict.words} words · Last used {dict.lastUsed}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
