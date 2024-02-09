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
    <div className="m-2">
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
        className="mt-2 ml-24 bg-gray-800 border-gray-300 text-white rounded-md p-1"
        onClick={handleSubmit}
      >
        Start Mapping
      </button>
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
    <div className="py-1 flex justify-between">
      <label htmlFor={name}>{column}</label>

      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mr-14"
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
