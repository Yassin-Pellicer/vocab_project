import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Brain, Zap, MessageSquare, Bot, Gauge } from "lucide-react";

export default function AISection() {
  return (
    <div className="mb-8 mt-2">
      <div className="space-y-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">Artificial Intelligence</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Sparkles className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">AI Suggestions</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Enable smart word recommendations based on your learning history and patterns. The AI analyzes your vocabulary to suggest words that complement your existing knowledge and fill gaps.
              </div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Brain className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Auto Translation</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Automatically translate newly added words using AI. Translations are generated in real-time when you add entries to a dictionary, saving you the effort of looking them up manually.
              </div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Smart Examples</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Generate contextual example sentences for each word using AI. Examples are tailored to your proficiency level and show the word used naturally in real-world contexts.
              </div>
            </div>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Zap className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Enhanced Learning</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Use AI-powered spaced repetition to optimize your review schedule. The algorithm adapts to your memory patterns and prioritizes words you're most likely to forget.
              </div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-4">Model</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Bot className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">AI Model</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Choose which AI model powers the application's features. More capable models produce higher quality results but may respond slower and use more of your usage quota.
              </div>
            </div>
          </div>
          <Select defaultValue="gpt4">
            <SelectTrigger className="">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt4">GPT-4</SelectItem>
              <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude3">Claude 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Gauge className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Response Quality</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Balance between speed and accuracy of AI responses. Higher quality produces more detailed and accurate results but takes longer to generate. Lower settings are faster for quick lookups.
              </div>
            </div>
          </div>
          <Select defaultValue="balanced">
            <SelectTrigger className="">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast">Fast</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="quality">High Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
