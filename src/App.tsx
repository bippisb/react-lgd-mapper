import { useState } from "react"
import { FileUpload } from "./components/FileUpload"
import SelectLGDCols from "./components/SelectLGDCols";
import { SelectColumnHierarchy } from "./components/SelectColumnHierarchy";
import type { Hierarchy } from "./components/SelectColumnHierarchy";


function App() {
  const [df, setDF] = useState<any | null>(null);
  const [lgdCols, setLGDCols] = useState<string[]>([]);
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  return (
    <>
      <h1 className="text-3xl font-bold underline">LGD Mapper</h1>
      <FileUpload onFileLoad={setDF} />
      {df !== null && <SelectLGDCols columns={df.columns} selectedCols={lgdCols} onSelectionChange={setLGDCols} />}
      {lgdCols.length > 0 && <SelectColumnHierarchy columns={lgdCols} onHierarchyChange={setHierarchy} />}
    </>
  )
}

export default App
