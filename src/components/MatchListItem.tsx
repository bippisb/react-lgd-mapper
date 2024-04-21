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
  "6": "panchayat",
  "7": "village"
}

const MatchListItem: FC<MatchListItemProps> = ({ match }) => (
  <div className="text-center bg-neutral-50 p-1 rounded-sm shadow-md relative">
    <div>
      <span>{match.name.toUpperCase()}</span>
      <div className="grid grid-cols-3 divide-x divide-stone-600 divide-opacity-50 border-t-[1px] border-stone-600">
        <div className="flex flex-col">
          <span className="text-xs border-b-stone-600 border-b-[1px] border-dashed border-opacity-50">Id</span>
          <span>{match.id.toString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs border-b-stone-600 border-b-[1px] border-dashed border-opacity-50">Level</span>
          <span>{match.level || LEVELS[match.level_id.toString() as keyof typeof LEVELS]}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs border-b-stone-600 border-b-[1px] border-dashed border-opacity-50">LGD</span>
          <span>{match.code.toString()}</span>
        </div>
      </div>
    </div>
    {match?.match_type && (
      <div className="absolute top-0 right-0 bg-cyan-900 text-white text-sm px-2">
        <span className="capitalize">{match.match_type}</span>
      </div>
    )}
    {match?.parents?.length && (
      <div>
        <div className="text-xs text-left uppercase">Parents</div>
        <MatchesTableView matches={match.parents} className="flex flex-row p-2 bg-slate-100 divide-x-2 gap-1" />
      </div>
    )}
  </div>
);

export default MatchListItem;
