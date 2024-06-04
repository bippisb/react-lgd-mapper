import { ChangeEvent, useEffect, useState } from "react";
import { DatasetUpload } from "./components/DatasetUpload";
import SelectLGDCols from "./components/SelectLGDCols";
import { SelectColumnHierarchy } from "./components/SelectColumnHierarchy";
import { buildLGDGraph, getLGDColsInHierarchicalOrder } from "./services/graph";
import { computeUnmatchedChildren, lgdMapInBatches } from "./services/lgd";
import { EntityView } from "./components/Entity";
import { LazyExplorer } from "./components/LazyExplorer";
import { Notes } from "./components/Notes";
import { getDuckDB, getUniqueRecords } from "./services/duckdb";
import { exportAppState, exportMappedDataFrame, exportUnMappedDataFrame, loadAppState, useAppState, useGraph } from "./services/state";
import { FileUpload } from "./components/FileUpload";
import Sidebar from "./components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export type AppState =
  | "initial"
  | "loading-csv"
  | "fetching"
  | "selecting-lgd-cols"
  | "selecting-hierarchy"
  | "csv-loaded";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const appState = useAppState();
  const graphState = useGraph();

  const {
    columns, setColumns,
    lgdCols, setLgdCols,
    mappingProgress, setMappingProgress,
    hierarchy, setHierarchy,
    activeNode, setActiveNode,
    resetState,
  } = appState;
  const { graph, setGraph } = graphState;

  const importAppState = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      loadAppState(file, appState, graphState);
    }
  }

  useEffect(() => {
    if (!file || lgdCols.length === 0 || !hierarchy) {
      return;
    }

    (async () => {
      const tid = toast.loading("Getting unique entites...")
      const orderedLGDCols = getLGDColsInHierarchicalOrder(hierarchy);
      const records = await getUniqueRecords(orderedLGDCols);
      toast.update(tid, { render: "Building LGD graph", type: "info", isLoading: true })
      console.log("loaded records", records.length)
      const lgdGraph = buildLGDGraph(records, hierarchy);
      console.log("built graph")
      setGraph(lgdGraph)
      toast.update(tid, { render: "Graph loaded", type: "success", isLoading: false, autoClose: 2000 })
    })()
  }, [file, lgdCols, hierarchy]);

  const startMapping = async () => {
    if (graph === null || hierarchy === null) {
      return
    }
    let mappedGraph = await lgdMapInBatches(
      graph,
      Object.values(hierarchy).map(v => v.name),
      100,
      (n) => {
        console.log(n);
        setMappingProgress(n);
      }
    );
    mappedGraph = computeUnmatchedChildren(mappedGraph);
    setGraph(mappedGraph.copy());
    // @ts-ignore
    window.graph = graph;
  }

  useEffect(() => {
    (async () => {
      // instantiate duckdb
      await getDuckDB();
    })()

  }, [])

  return (
    <>
      <div className="bg-gray-300">
        <header className="flex justify-between p-2 ml-16">
          <h1 className="text-3xl font-bold flex justify-center">
            LGD Mapper
          </h1>
          <div className="grid grid-cols-2 gap-2 divide-x divide-stone-400">
            <div>
              <div className="text-xs">Import app state</div>
              <FileUpload handleChange={importAppState} accept=".json" />
            </div>
            {graph !== null && (
              <div className="pl-2">
                <div className="flex flex-row gap-2">
                  <button
                    className="text-gray-50 px-2 text-sm bg-cyan-900 border-2 border-cyan-800"
                    onClick={() => exportAppState(appState, graphState)}>
                    App State
                  </button>
                  <div>
                    <div className="text-sm bg-gray-600 text-gray-50 text-center">DataFrame</div>
                    <div>
                      <button
                        className="px-2 text-gray-50 text-sm bg-cyan-900 border-2 border-cyan-800"
                        onClick={() => exportMappedDataFrame(graph, appState.hierarchy!)}
                      >
                        Mapped
                      </button>
                      <button
                        className="px-2 text-gray-50 text-sm bg-cyan-900 border-2 border-cyan-800"
                        onClick={() => exportUnMappedDataFrame(graph, appState.hierarchy!)}
                      >
                        Unmapped
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
        <main>
          <Sidebar open={!hierarchy}>
            <div className=" bg-white bg-opacity-50 p-2 h-screen overflow-auto">
              <DatasetUpload setFile={(f) => { resetState(); setFile(f); }} setColumnNames={setColumns} /* setUIState={setState} */ />
              {columns !== null && (
                <SelectLGDCols
                  columns={columns}
                  selectedCols={lgdCols}
                  onSelectionChange={setLgdCols}
                />
              )}
              {lgdCols.length > 0 && (
                <SelectColumnHierarchy
                  columns={lgdCols}
                  onHierarchyChange={setHierarchy}
                />
              )}
            </div>
          </Sidebar>
          <div className="grid grid-cols-2 gap-1 mx-1">
            <div className="bg-white bg-opacity-50 p-2 h-screen max-h-[90%] overflow-auto">
              {/* @ts-ignore */}
              {graph !== null ? (
                <>
                  <div className="flex justify-between mb-1">
                    {mappingProgress !== null && (<span className="algin-middle px-2">{(100 * mappingProgress).toFixed(2)} %</span>)}
                    <button
                      className="py-1 px-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-md shadow-sm hover:text-gray-700 hover:bg-gray-100"
                      onClick={startMapping}
                    >
                      Fetch Matches
                    </button>
                  </div>
                  <LazyExplorer graph={graph} setActiveNode={setActiveNode} />
                </>
              ) : <Notes />
              }
            </div>
            <div className="bg-white bg-opacity-50 p-2 h-screen max-h-[90%] overflow-auto">
              {activeNode !== null && graph !== null && (
                <EntityView node={activeNode} graph={graph} setGraph={setGraph} />
              )}
            </div>
          </div>
        </main>
        <ToastContainer position={"top-right"} />
      </div>
    </>
  );
}

export default App;
