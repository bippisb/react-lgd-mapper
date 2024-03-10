import { ILGDMatch } from "../types";
import { FC } from "react";
import { MatchesTableView } from "./MatchesTableView";

export interface MatchListItemProps {
  match: ILGDMatch;
}

const MatchListItem: FC<MatchListItemProps> = ({ match }) => (
  <div className="text-center bg-neutral-50 p-1 rounded-sm shadow-md">
    <div>
      <span>{match.name.toUpperCase()}</span>
      <div className="grid grid-cols-3 divide-x divide-stone-600 divide-opacity-50 border-t-[1px] border-stone-600">
        <div className="flex flex-col">
          <span className="text-xs border-b-stone-600 border-b-[1px] border-dashed border-opacity-50">Id</span>
          <span>{match.id}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs border-b-stone-600 border-b-[1px] border-dashed border-opacity-50">Level</span>
          <span>{match.level || match.level_id}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs border-b-stone-600 border-b-[1px] border-dashed border-opacity-50">LGD</span>
          <span>{match.code}</span>
        </div>
      </div>
    </div>
    {match?.parents?.length && (
      <div>
        <div className="text-xs text-left uppercase">Parents</div>
        <div className="flex m-2">
          <MatchesTableView matches={match.parents} />
        </div>
      </div>
    )}
  </div>
);

export default MatchListItem;
