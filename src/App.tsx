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
import { Tooltip } from "./components/Tooltip";
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
      <div className="bg-gray-800 min-h-screen">
        <header className="flex justify-between items-center bg-gray-700">
        </header>
        <main className="flex">
          <Sidebar open={!hierarchy} className="bg-gray-700">
            <div className="bg-white bg-opacity-50 p-4 h-screen overflow-auto">
              <div>
                <div className="flex">
                  <label className="mb-1 mr-1 text-base font-medium text-gray-900 ">
                    Import App State
                  </label>
                  <Tooltip text="Upload a previously exported app state to continue your mapping process." />
                </div>
                <div className="p-2">
                  <FileUpload handleChange={importAppState} accept=".json" />
                </div>
              </div>
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
              {graph !== null && (
                <div>
                  <div className="flex flex-col">
                    <div className="mb-1 mr-1 text-base font-medium text-gray-900">Export</div>
                    <button
                      className="px-4 py-2 text-sm font-semibold text-white bg-amaranth rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200 mb-2"
                      onClick={() => exportAppState(appState, graphState)}
                    >
                      App State
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-semibold text-white bg-amaranth rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200 mb-2"
                      onClick={() => exportMappedDataFrame(graph, appState.hierarchy!)}
                    >
                      Mapped Rows
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-semibold text-white bg-amaranth rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200 mb-2"
                      onClick={() => exportUnMappedDataFrame(graph, appState.hierarchy!)}
                    >
                      Unmapped Rows
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Sidebar>
          <div className="grid grid-cols-2 gap-1 p-4 flex-grow">
            <div className="bg-white bg-opacity-50 p-1 rounded-md shadow-md">
              {/* @ts-ignore */}
              {graph !== null ? (
                <>
                  <div className="flex justify-end items-center mb-1 sticky top-0">
                    {mappingProgress !== null && (
                      <span className="px-2 py-1 text-white rounded-md">
                        {(100 * mappingProgress).toFixed(2)} %
                      </span>
                    )}
                    <button
                      className="px-4 py-2 text-sm font-semibold text-white bg-amaranth rounded-md shadow-md hover:bg-amaranth-stronger transition-colors duration-200"
                      onClick={startMapping}
                    >
                      Fetch Matches
                    </button>
                  </div>
                  <LazyExplorer graph={graph} setActiveNode={setActiveNode} />
                </>
              ) : (
                <Notes />
              )}
            </div>
            <div className="bg-white bg-opacity-50 p-1 rounded-md shadow-md">
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
