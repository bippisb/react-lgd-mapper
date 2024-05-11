import { ChangeEvent, FC } from "react";
import { loadDatasetAsTable } from "../services/duckdb";
import { Tooltip } from "./Tooltip";
import { FileUpload } from "./FileUpload";

interface DatasetUploaderProps {
  setFile: (file: File) => void;
  setColumnNames: (columns: string[]) => void;
  //   setUIState: (state: AppState) => void;
}

export const DatasetUpload: FC<DatasetUploaderProps> = ({ setFile, setColumnNames }) => {
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const columnNames = await loadDatasetAsTable(file);
      setFile(file);
      setColumnNames(columnNames);
    }
  };
  return (
    <div>
      <div className="flex">
        <label className="mb-1 mr-1 text-base font-medium text-gray-900 ">
          Upload Dataset
        </label>
        <Tooltip text="The file should contain only unique records of LGD entities." />
      </div>
      <div className="p-2">
      <FileUpload handleChange={handleChange} subtext="Only CSV and Parquet files are allowed" accept=".csv,.parquet" />
      </div>
    </div>
  );
};