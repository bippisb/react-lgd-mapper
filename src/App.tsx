import { useEffect, useState } from "react"
import { FileUpload } from "./components/FileUpload"
import SelectLGDCols from "./components/SelectLGDCols";
import { SelectColumnHierarchy } from "./components/SelectColumnHierarchy";
import type { Hierarchy } from "./components/SelectColumnHierarchy";
import { DirectedGraph } from "graphology";
import { buildLGDGraph } from "./services/graph";
import { Explorer } from "./components/Explorer";


function App() {
  const [df, setDF] = useState<any | null>(null);
  const [lgdCols, setLGDCols] = useState<string[]>([]);
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [graph, setGraph] = useState<DirectedGraph | null>(null);

  const isHierarchySet =  () => !!df && lgdCols.length > 0 && !!hierarchy
  useEffect(() => {
    if (!isHierarchySet()) {
      return
    }
    // @ts-ignore
    const lgdGraph = buildLGDGraph(df, hierarchy);
    // @ts-ignore
    window.graph = lgdGraph
    setGraph(lgdGraph)
  }, [df, lgdCols, hierarchy]);

  return (
    <>
      <h1 className="text-3xl font-bold underline">LGD Mapper</h1>
      <FileUpload onFileLoad={setDF} />
      {df !== null && <SelectLGDCols columns={df.columns} selectedCols={lgdCols} onSelectionChange={setLGDCols} />}
      {lgdCols.length > 0 && <SelectColumnHierarchy columns={lgdCols} onHierarchyChange={setHierarchy} />}
      {/* @ts-ignore */}
      {isHierarchySet() && graph !== null && <Explorer graph={graph}/>}
    </>
  )
}

export default App
