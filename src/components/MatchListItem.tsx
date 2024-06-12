import { ILGDMatch } from "../types";
import { FC } from "react";
import { MatchesTableView } from "./MatchesTableView";

export interface MatchListItemProps {
  match: ILGDMatch;
}

const LEVELS = {
  "1": "india",
  "2": "state",
  "3": "district",
  "4": "sub district",
  "5": "block",
  "6": "gram panchayat",
  "7": "village",
  "8": "assembly constituency",
  "9": "parliamentary constituency",
  "10": "intermediate panchayat",
  "11": "district panchayat",
};

const MatchListItem: FC<MatchListItemProps> = ({ match }) => (
  <div className="text-gray-200 bg-gray-700 rounded-md shadow-md relative">
    <div className="p-1">
      <span className="font-semibold">{match.name.toUpperCase()}</span>
      <div className="grid grid-cols-3 divide-x divide-gray-500 mt-2">
        <div className="flex flex-col pl-1">
          <span className="text-xs text-gray-400">Id</span>
          <span>{match.id.toString()}</span>
        </div>
        <div className="flex flex-col pl-1">
          <span className="text-xs text-gray-400">Level</span>
          <span>
            {match.level ||
              LEVELS[match.level_id.toString() as keyof typeof LEVELS]}
          </span>
        </div>
        <div className="flex flex-col pl-1">
          <span className="text-xs text-gray-400">LGD</span>
          <span>{match.code.toString()}</span>
        </div>
      </div>
    </div>
    {match?.match_type && (
      <div className="absolute top-0 right-0 bg-amaranth-lighter text-white text-sm px-2 py-1 rounded-tr-md">
        <span className="capitalize">{match.match_type}{match.match_type == "fuzzy" && match?.score && ` : ${match.score.toFixed(2)}`}</span>
      </div>
    )}
    {match?.parents?.length && (
      <div className="mt-2">
        <div className="text-xs text-gray-400 uppercase mb-1 ml-1">Parents</div>
        <MatchesTableView
          matches={match.parents}
          className="flex flex-row gap-2 bg-gray-600 rounded-md p-2"
        />
      </div>
    )}
  </div>
);

export default MatchListItem;