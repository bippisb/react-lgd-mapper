/**
 * WHAT THIS FILE DOES:
 * - Provides the UI for a user to upload their dataset.
 * - It now parses the entire file and stores its content in the global state.
 *
 * WHAT CHANGED:
 * - Removed all dependencies on DuckDB.
 * - Uses the 'papaparse' library to parse CSV files in the browser.
 * - On successful parsing, it calls 'setRawFileData' and 'setColumnNames' from
 *   the Zustand store to make the data available to the whole app.
 */
import { ChangeEvent, FC } from "react";
import { toast } from "react-toastify";
import Papa from "papaparse"; // You installed this: npm install papaparse
import { FileUpload } from "./FileUpload";
import { useAppState } from "../services/state";

export const DatasetUpload: FC = () => {
  // Get setters from the global state
  const { setRawFileData, setColumns } = useAppState();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const tid = toast.loading("Parsing dataset...");

      // Use Papaparse to read the file
      Papa.parse(file, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            toast.update(tid, { render: "Error parsing CSV.", type: "error", isLoading: false, autoClose: 3000 });
            console.error("Parsing errors:", results.errors);
            return;
          }
          
          toast.update(tid, { render: "Dataset loaded successfully!", type: "success", isLoading: false, autoClose: 2000 });
          
          // Store the parsed data and column names in the global state
          setColumns(results.meta.fields || []);
          setRawFileData(results.data);
        },
        error: (error) => {
           toast.update(tid, { render: "Failed to read file.", type: "error", isLoading: false, autoClose: 3000 });
           console.error("Papaparse error:", error);
        }
      });
    }
  };

  return (
    <div>
      <div className="flex">
        <label className="mb-1 mr-1 text-base font-medium text-gray-900 ">
          Upload Dataset
        </label>
        {/* You can add a Tooltip component here if needed */}
      </div>
      <div className="p-2">
        <FileUpload handleChange={handleChange} subtext="Only CSV files are currently supported" accept=".csv" />
      </div>
    </div>
  );
};