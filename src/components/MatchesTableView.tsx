import { ILGDMatch } from "../types";
import { FC } from "react";
import MatchListItem from "./MatchListItem";

export interface MatchesTableViewProps {
  matches: ILGDMatch[];
  node?: string;
  onSelect?: (m: ILGDMatch) => void;
  match?: ILGDMatch;
  className?: string;
}

export const MatchesTableView: FC<MatchesTableViewProps> = ({
  match,
  matches,
  onSelect = () => { },
  className = "flex flex-col gap-2",
}) => (
  <div className={`${className} bg-gray-800 rounded-md shadow-md`}>
    {matches.map((m) => (
      <div
        key={m.id.toString()}
        onClick={() => onSelect(m)}
        className={`${match?.id === m.id
            ? "bg-amaranth-stronger hover:bg-amaranth-stronger"
            : "bg-gray-700 hover:bg-gray-600"
          } rounded-md p-1 cursor-pointer transition-colors duration-200`}
      >
        <MatchListItem match={m} />
      </div>
    ))}
  </div>
);