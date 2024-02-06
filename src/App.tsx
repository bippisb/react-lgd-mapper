import { useEffect, useState } from "react"
import { FileUpload } from "./components/FileUpload"
import SelectLGDCols from "./components/SelectLGDCols";
import { SelectColumnHierarchy } from "./components/SelectColumnHierarchy";
import type { Hierarchy } from "./components/SelectColumnHierarchy";
import { DirectedGraph } from "graphology";
import { buildLGDGraph } from "./services/graph";
import { Explorer } from "./components/Explorer";
import { lgdMapGraph } from "./services/lgd";


function App() {
  const [df, setDF] = useState<any | null>(null);
  const [lgdCols, setLGDCols] = useState<string[]>([]);
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [graph, setGraph] = useState<DirectedGraph | null>(null);
  const [node, setNode] = useState<string | null>(null);

  const isHierarchySet = () => !!df && lgdCols.length > 0 && !!hierarchy;
  useEffect(() => {
    if (!isHierarchySet()) {
      return
    }
    // @ts-ignore
    const lgdGraph = buildLGDGraph(df, hierarchy);
    // @ts-ignore
    window.graph = lgdGraph;
    setGraph(lgdGraph);

    (async () => {
      const mappedGraph = await lgdMapGraph(lgdGraph);
      setGraph(mappedGraph.copy()
      );
    })()
  }, [df, lgdCols, hierarchy]);

  return (
    <>
      <h1 className="text-3xl font-bold underline">LGD Mapper</h1>
      <main className="grid grid-cols-3 gap-1">
        <div className="bg-stone-200  ">
          <FileUpload onFileLoad={setDF} />
          {df !== null && <SelectLGDCols columns={df.columns} selectedCols={lgdCols} onSelectionChange={setLGDCols} />}
          {lgdCols.length > 0 && <SelectColumnHierarchy columns={lgdCols} onHierarchyChange={setHierarchy} />}
        </div>
        <div className="bg-stone-200">
          {/* @ts-ignore */}
          {isHierarchySet() && graph !== null && <Explorer graph={graph} setActiveNode={setNode} />}
        </div>
        <div className="bg-stone-200">
          {node !== null && graph !== null && (
            <pre>
              {JSON.stringify(graph.getNodeAttributes(node), null, 2)}
            </pre>
          )}
        </div>
      </main>
    </>
  )
}

export default App
