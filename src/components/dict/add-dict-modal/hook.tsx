import { useState } from "react";

export default function useDictModalHooks() {
  const [route, setRoute] = useState("");
  const [name, setName] = useState("");

  const handleFolderSelect = async () => {
    try {
      const dirHandle = await (window.api).selectFolder();
      setRoute(dirHandle);
    } catch (err) {
      console.error(err)
    }
  };

  const handleSubmit = async (_e: any) => {
    await (window.api).createDictionary(route, name);
    setRoute("");
    setName("");
  };

  return {
    handleFolderSelect,
    handleSubmit,
    route,
    setRoute,
    name,
    setName,
  };
}