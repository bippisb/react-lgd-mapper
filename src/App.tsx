/**
 * WHAT THIS FILE DOES:
 * - This is the root component of the application. It manages the overall layout
 *   and orchestrates the multi-step user workflow:
 *   1. Upload Data -> 2. Select Columns -> 3. Define Hierarchy -> 4. Map Data -> 5. Explore Results.
 *
 * WHAT CHANGED (in this final version):
 * - The JSX inside the <Sidebar> component has been fully restored and corrected.
 * - <DatasetUpload /> is now correctly rendered, allowing the user to start the process.
 * - Conditional rendering is used to show/hide components as the user progresses:
 *   - `SelectLGDCols` appears only after columns have been loaded from a file.
 *   - `SelectColumnHierarchy` appears only after the user has selected LGD columns.
 * - The "Start/Rematch All" button has been moved into the sidebar to create a more logical flow.
 * - Export buttons are also correctly placed within the sidebar and will appear after a graph is generated.
 */

import { FC, useEffect } from "react"; // Explicitly importing FC for clarity
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// State Management and Services
import { useAppState, useGraph, exportAppState } from "./services/state.ts";
import { runHierarchicalMapping } from "./services/mapping-service.ts";
import { buildGraphFromMappingResults } from "./services/graph-builder.ts";

// Components
import { DatasetUpload } from "./components/DatasetUpload.tsx";
import SelectLGDCols from "./components/SelectLGDCols.tsx";
import { SelectColumnHierarchy } from "./components/SelectColumnHierarchy.tsx";
import { EntityView } from "./components/Entity.tsx";
import { LazyExplorer } from "./components/LazyExplorer.tsx";
import Sidebar from "./components/Sidebar.tsx";
import { Notes } from "./components/Notes.tsx";


const App: FC = () => {
  // Get state and actions from the Zustand store
  const {
    columns, lgdCols, hierarchy, activeNode, rawFileData, fetchLevels,
    setLgdCols, setHierarchy, setActiveNode
  } = useAppState();
  
  
  const { graph, setGraph } = useGraph();
  
  // --- NEW: Fetch essential data when the application loads ---
  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]); // fetchLevels is stable, so this runs once on mount.


  const startMapping = async () => {
    if (!rawFileData || !hierarchy) {
      toast.error("Please upload data and define the column hierarchy first.");
      return;
    }

    const tid = toast.loading("Starting hierarchical mapping...");

    try {
      // Step 1: Call the mapping service to handle all API calls and data processing.
      const { uniqueData, levelMatchResults } = await runHierarchicalMapping(rawFileData, hierarchy);

      toast.update(tid, { render: "Building visualization..." });

      // Step 2: Build the visual graph from the final, consolidated results.
      const newGraph = buildGraphFromMappingResults(uniqueData, levelMatchResults, hierarchy);
      setGraph(newGraph);
      
      toast.update(tid, { render: "Mapping complete!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error(err);
      const errorMessage = (err as any).response?.data?.detail || "An API error occurred.";
      toast.update(tid, { render: `Error: ${errorMessage}`, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  return (
    <>
      <div className="bg-gray-800 min-h-screen font-sans">
        <main className="flex">
          {/* The Sidebar is now permanently open for a better user experience */}
          <Sidebar open={true}>
            <div className="p-4 h-screen overflow-auto">
              <h1 className='text-2xl font-bold text-white text-center mb-4'>LGD Mapper</h1>
              
              {/* --- SECTION 1: DATA SETUP --- */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <h2 className="font-bold text-lg text-white mb-2 border-b border-gray-600 pb-1">Setup</h2>
                
                {/* Step 1: Always show the dataset uploader */}
                <DatasetUpload />
                
                {/* Step 2: Show column selector only after a file is uploaded */}
                {columns && (
                  <SelectLGDCols
                    columns={columns}
                    selectedCols={lgdCols}
                    onSelectionChange={setLgdCols}
                  />
                )}
                
                {/* Step 3: Show hierarchy definer only after columns are selected */}
                {lgdCols.length > 0 && (
                  <SelectColumnHierarchy
                    columns={lgdCols}
                    onHierarchyChange={setHierarchy}
                  />
                )}

                {/* Step 4: Show the main action button only when setup is complete */}
                {hierarchy && rawFileData && (
                   <button
                      className="w-full mt-4 px-4 py-2 text-md font-semibold text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 transition-colors duration-200"
                      onClick={startMapping}
                    >
                      Start Matching
                    </button>
                )}
              </div>

              {/* --- SECTION 2: EXPORT (appears after mapping) --- */}
              {graph && (
                <div className="bg-gray-700 p-3 rounded-lg mt-4">
                   <h2 className="font-bold text-lg text-white mb-2 border-b border-gray-600 pb-1">Export</h2>
                    <button
                      className="w-full px-4 py-2 text-sm font-semibold text-white bg-amaranth rounded-md shadow-md hover:bg-amaranth-stronger transition-colors"
                      onClick={() => exportAppState(useAppState.getState(), useGraph.getState())}
                    >
                      Export Full App State
                    </button>
                </div>
              )}
            </div>
          </Sidebar>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 flex-grow ml-80"> {/* ml-80 to offset for sidebar */}
            {/* Left Panel: The Explorer Tree */}
            <div className="bg-white bg-opacity-70 p-2 rounded-md shadow-md">
              {graph ? (
                <LazyExplorer graph={graph} setActiveNode={setActiveNode} />
              ) : (
                <Notes />
              )}
            </div>
            
            {/* Right Panel: The Entity Detail View */}
            <div className="bg-white bg-opacity-70 p-2 rounded-md shadow-md">
              {activeNode && graph ? (
                <EntityView node={activeNode} graph={graph} setGraph={setGraph} />
              ) : (
                <div className="p-4 text-center mt-10">
                    <h3 className="text-lg font-semibold">Entity Details</h3>
                    <p className="text-gray-600 mt-2">Select an item from the explorer tree on the left to view its details and potential matches.</p>
                </div>
              )}
            </div>
          </div>
        </main>
        <ToastContainer position={"top-right"} theme="dark" />
      </div>
    </>
  );
};

export default App;