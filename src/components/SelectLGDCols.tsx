import React, { FC } from "react";

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
    <div className="mt-2 relative">
      <h3>LGD Columns</h3>
      <div className="relative w-80 max-h-60 overflow-auto border-black border-1">
        {
          <div className="bg-white p-1">
            {columns.map((column) => (
              <label key={column} className="block ml-3">
                <input
                  type="checkbox"
                  className="mr-2 accent-gray-800"
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
