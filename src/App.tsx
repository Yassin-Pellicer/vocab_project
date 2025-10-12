import './App.css'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NavUser } from './components/nav-user'
import TranslationGame from './components/translationGame'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky justify-between top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex flex-row items-center">
            <SidebarTrigger className="-ml-1" />
            <div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Separator orientation="vertical" className="ml-2 h-4" />
            </div>
          </div>
          <div>
            <NavUser
              user={{
                name: "John Doe",
                email: "john.doe@example.com",
                avatar: "",
              }}
            />
          </div>
        </header>
        <div className="flex max-w-full flex-col gap-4 p-4">
          <TranslationGame></TranslationGame>
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted/50 aspect-video h-12 w-full rounded-lg"
            />
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
