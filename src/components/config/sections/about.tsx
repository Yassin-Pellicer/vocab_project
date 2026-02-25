import { Info, Github, Twitter, Mail, Scale, Cpu, MonitorSmartphone, CalendarDays, BookOpen } from "lucide-react";

export default function AboutSection() {
  return (
    <div className="mb-8 mt-2">
      <div className="space-y-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Info className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Application</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Vocab Project is a modern vocabulary learning application designed to help you build and retain vocabulary efficiently using spaced repetition and AI-powered tools.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium shrink-0">v1.0.0</div>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <CalendarDays className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Build Date</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                The date this version of the application was compiled and packaged for distribution.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono shrink-0">2024.02.04</div>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <MonitorSmartphone className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Platform</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Built with Electron and React, enabling a native desktop experience on Windows, macOS, and Linux while leveraging modern web technologies under the hood.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium shrink-0">Electron + React</div>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Scale className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">License</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                This project is released under the MIT License, granting you the freedom to use, modify, and distribute the software with minimal restrictions.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium shrink-0">MIT</div>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Cpu className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Runtime</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Core runtime versions powering the application. Chromium handles rendering, Node.js provides backend capabilities, and Electron bridges them together.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono shrink-0">Node 20 · Electron 28</div>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <BookOpen className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Documentation</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Visit the project documentation for guides, tutorials, API references, and troubleshooting help. Contributions to the docs are always welcome.
              </div>
            </div>
          </div>
          <a href="#" className="text-xs text-blue-600 hover:text-blue-800 underline shrink-0">View Docs</a>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-4">Connect</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Github className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">GitHub Repository</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Browse the source code, report bugs, request features, or contribute to the project on GitHub. Star the repo to show your support.
              </div>
            </div>
          </div>
          <a href="#" className="text-xs text-blue-600 hover:text-blue-800 underline shrink-0">Open</a>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Twitter className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Twitter / X</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Follow us for the latest updates, feature announcements, and tips on getting the most out of your vocabulary learning journey.
              </div>
            </div>
          </div>
          <a href="#" className="text-xs text-blue-600 hover:text-blue-800 underline shrink-0">Follow</a>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Mail className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Contact</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Have questions, feedback, or partnership inquiries? Reach out to us directly via email and we'll get back to you as soon as possible.
              </div>
            </div>
          </div>
          <a href="#" className="text-xs text-blue-600 hover:text-blue-800 underline shrink-0">Email Us</a>
        </div>
      </div>
    </div>
  );
}
