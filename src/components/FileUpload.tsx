import { ChangeEvent, FC, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface FileUploaderProps {
  onFileLoad: (df: any) => void;
  //   setUIState: (state: AppState) => void;
}

export const FileUpload: FC<FileUploaderProps> = ({ onFileLoad }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      console.log(file);
      setIsLoading(true);
      const df = await dfd.readCSV(file);
      setIsLoading(false);
      // @ts-ignore
      window.df = df;
      console.log(df);
      onFileLoad(df);
    }
  };
  return (
    <div>
      <div className="flex">
        <label className="mb-2 mr-2 text-base font-medium text-gray-900 ">
          Upload file
        </label>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="25"
            height="25"
            viewBox="0 0 50 50"
            className="icon"
          >
            <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z"></path>
          </svg>

          <div className="info-popup text-sm">
            The file should contain only unique records of LGD entities.
          </div>
        </div>
      </div>

      <input
        className="block w-full mb-2 text-base text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:bg-gray-700 file:text-white"
        id="file_input"
        type="file"
        accept=".csv"
        onChange={handleChange}
      />
      <p className=" ml-2 text-sm text-gray-600"> Only CSV is allowed </p>
      {isLoading && <LoadingSpinner />}
    </div>
  );
};
