import { ILGDMatch } from "../types";
import { FC } from "react";
import MatchListItem from "./MatchListItem";

export interface MatchesTableViewProps {
  matches: ILGDMatch[];
  node?: string;
  onSelect?: (m: ILGDMatch) => void;
  match?: ILGDMatch
}

export const MatchesTableView: FC<MatchesTableViewProps> = ({
  match,
  matches,
  onSelect = () => {},
}) => (
  <div className="flex flex-col gap-2">
    {matches.map((m) => (
      <div
        key={m.id}
        onClick={() => onSelect(m)}
        className={match?.id === m.id ? "outline outline-offset-2 outline-blue-800" : ""}
      >
        <MatchListItem match={m} />
      </div>
    ))}
  </div>
);
