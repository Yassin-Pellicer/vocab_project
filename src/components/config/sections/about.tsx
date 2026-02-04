import { Info, Github, Twitter, Mail } from "lucide-react";

export default function AboutSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">About</h2>
        <p className="text-sm text-muted-foreground">
          Information about this application
        </p>
      </div>

      <div className="p-6 rounded-lg border bg-card text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Info className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Vocab Project</h3>
        <p className="text-sm text-muted-foreground mb-4">
          A modern vocabulary learning application
        </p>
        <div className="text-xs text-muted-foreground">Version 1.0.0</div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
          <span className="text-muted-foreground">License</span>
          <span className="font-medium">MIT</span>
        </div>
        <div className="flex justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
          <span className="text-muted-foreground">Build</span>
          <span className="font-mono text-xs">2024.02.04</span>
        </div>
        <div className="flex justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
          <span className="text-muted-foreground">Platform</span>
          <span className="font-medium">Electron + React</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Connect With Us</h3>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-accent transition-colors text-sm">
            <Github className="h-4 w-4" />
            GitHub
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-accent transition-colors text-sm">
            <Twitter className="h-4 w-4" />
            Twitter
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-accent transition-colors text-sm">
            <Mail className="h-4 w-4" />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}
