import { FC, useState, useEffect } from "react";
import { getLevels } from "../api";
import { ILGDLevel } from "../types";

export type Hierarchy = { [lgdCol: string]: any };
interface SelectColHierarchyProps {
  columns: string[];
  onHierarchyChange: (hierarchy: Hierarchy) => void;
}

export const SelectColumnHierarchy: FC<SelectColHierarchyProps> = ({
  columns,
  onHierarchyChange,
}) => {
  const [levels, setLevels] = useState<ILGDLevel[]>([]);
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});

  useEffect(() => {
    (async () => {
      const levels = await getLevels();
      setLevels(levels);
    })();
  }, []);

  const handleChange = (lgdCol: string, level: string) => {
    setHierarchy((state) => ({
      ...state,
      [lgdCol]: levels.find((l) => l.name == level),
    }));
  };

  const handleSubmit = () => onHierarchyChange(hierarchy);

  return (
    <div>
      <hr className="border-gray-600 border-1 my-1"/>
      <h3>Column Hierarchy</h3>
      <div className="p-2">
        <div className="mb-1 flex justify-between border-b-2 border-dotted border-gray-400 align-bottom text-xs">
          <span>Column Name</span>
          <span>Administrative Level</span>
        </div>
        {levels.length > 0 &&
          columns.map((col) => (
            <SelectLGDLevel
              levels={levels}
              column={col}
              value={hierarchy[col]?.name}
              onChange={(v: string) => handleChange(col, v)}
              key={col}
            />
          ))}
        <button
          className="m-4 float-right bg-gray-600 border-gray-700 border-2 text-white hover:text-gray-700 hover:bg-gray-100  rounded-md py-1 px-4"
          onClick={handleSubmit}
        >
          Start Mapping
        </button>
      </div>
    </div>
  );
};

interface SelectLGDLevelProps {
  levels: ILGDLevel[];
  column: string;
  value: string;
  onChange: (value: string) => void;
}

export const SelectLGDLevel: FC<SelectLGDLevelProps> = ({
  levels,
  column,
  value,
  onChange,
}) => {
  const name = `lgdLevel${column}`;
  return (
    <div className="mb-1 flex justify-between border-b-2 border-dotted border-gray-400">
      <label htmlFor={name} className="align-middle">{column}</label>

      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="float-right"
      >
        <option className="bg-gray-300" value="" defaultValue={value}>
          Level
        </option>
        {levels.map((level) => (
          <option key={column + level.name} value={level.name}>
            {level.name}
          </option>
        ))}
      </select>
    </div>
  );
};
