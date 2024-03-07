import React, { FC } from "react";
import { Tooltip } from "./Tooltip";

interface SelectLGDColsProps {
  columns: string[];
  selectedCols: string[];
  onSelectionChange: (selectedCols: string[]) => void;
}

const SelectLGDCols: FC<SelectLGDColsProps> = ({
  columns,
  selectedCols,
  onSelectionChange,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.currentTarget;
    if (checked) {
      onSelectionChange([...selectedCols, value]);
    } else {
      onSelectionChange(selectedCols.filter((col) => col !== value));
    }
  };

  return (
    <div>
      <hr className="border-gray-600 border-1 my-1"/>
      <h3 className="flex gap-1">
        <span>LGD Columns</span>
        <Tooltip text="Select columns containing names of geographical places"/>
      </h3>
      <div className="max-h-60 overflow-auto border-black border-1 p-2">
        {
          <div className="bg-white p-1">
            {columns.map((column) => (
              <label key={column} className="block ml-3">
                <input
                  type="checkbox"
                  className="mr-2 accent-gray-800 align-middle"
                  value={column}
                  checked={selectedCols.includes(column)}
                  onChange={handleCheckboxChange}
                />
                {column}
              </label>
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default SelectLGDCols;
