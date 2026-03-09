import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"

export default function NoteDisplay({route, name}: {route: string, name: string}) {
  return (
    <div className="flex justify-center top-16">
      <div className="max-w-full p-4">
        <SimpleEditor route={route} name={name} />
      </div>
    </div>
  )
}