import { FC } from 'react';

interface SelectLGDColsProps {
    columns: string[];
    selectedCols: string[];
    onSelectionChange: (selectedCols: string[]) => void;
}

const SelectLGDCols: FC<SelectLGDColsProps> = ({ columns, selectedCols, onSelectionChange }) => {
    return (
        <div>
            <h3>LGD Columns</h3>
            <select
                multiple
                value={selectedCols}
                size={columns.length < 10 ? columns.length : 10}
                onChange={(e) => onSelectionChange(Array.from(e.target.selectedOptions, option => option.value))}
            >
                {columns.map(column => (
                    <option key={column}>{column}</option>
                ))}
            </select>
        </div>
    );
};

export default SelectLGDCols;
