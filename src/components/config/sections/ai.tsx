import { Switch } from "@/components/ui/switch";
import { Sparkles, Brain, Zap, MessageSquare } from "lucide-react";

export default function AISection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Artificial Intelligence</h2>
        <p className="text-sm text-muted-foreground">
          Configure AI-powered features and suggestions
        </p>
      </div>

      <div className="space-y-3">
        {/* AI Suggestions */}
        <div className="flex items-center justify-between py-3 px-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1">
              <div className="text-sm font-medium">AI Suggestions</div>
              <div className="text-xs text-muted-foreground">Get smart word recommendations</div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Auto Translation */}
        <div className="flex items-center justify-between py-3 px-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-3 flex-1">
            <Brain className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1">
              <div className="text-sm font-medium">Auto Translation</div>
              <div className="text-xs text-muted-foreground">Automatically translate new words</div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Smart Examples */}
        <div className="flex items-center justify-between py-3 px-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-3 flex-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1">
              <div className="text-sm font-medium">Smart Examples</div>
              <div className="text-xs text-muted-foreground">Generate contextual example sentences</div>
            </div>
          </div>
          <Switch />
        </div>

        {/* Enhanced Learning */}
        <div className="flex items-center justify-between py-3 px-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-3 flex-1">
            <Zap className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1">
              <div className="text-sm font-medium">Enhanced Learning</div>
              <div className="text-xs text-muted-foreground">AI-powered spaced repetition</div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-card">
        <div className="text-sm font-medium mb-2">AI Model</div>
        <select className="w-full p-2 rounded-md border bg-background text-sm">
          <option>GPT-4</option>
          <option>GPT-3.5 Turbo</option>
          <option>Claude 3</option>
        </select>
      </div>
    </div>
  );
}
