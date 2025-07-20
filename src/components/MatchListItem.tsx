/**
 * WHAT THIS FILE DOES:
 * - A simple, reusable component to display the details of a single LGD match.
 *
 * WHAT CHANGED:
 * - Added a visual element (a styled div) to display the 'confidence_score'
 *   as a percentage. This gives the user immediate feedback on match quality.
 * - Displays the 'match_type' (e.g., 'exact', 'fuzzy') for more context.
 */
import { ILGDMatch } from "../types";
import { FC } from "react";
// Assumes MatchesTableView is still needed for displaying parents
import { MatchesTableView } from "./MatchesTableView";

export interface MatchListItemProps {
  match: ILGDMatch;
}

const MatchListItem: FC<MatchListItemProps> = ({ match }) => (
  <div className="text-gray-200 bg-gray-700 rounded-md shadow-md relative p-2">
    {/* Main details */}
    <span className="font-semibold">{match.name.toUpperCase()}</span>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">LGD Code</span>
        <span>{match.entity_code.toString()}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">Level</span>
        <span>{match.level || `ID: ${match.level_id}`}</span>
      </div>
    </div>

    {/* NEW: Confidence Score and Match Type */}
    <div className="absolute top-1 right-1 flex items-center gap-2">
        <span className="text-xs capitalize bg-gray-600 px-2 py-1 rounded">
            {match.match_type}
        </span>
        <span className="text-sm font-bold text-cyan-300">
            {`${(match.confidence_score * 100).toFixed(0)}%`}
        </span>
    </div>

    {/* Parent display can remain if the API provides it */}
    {match?.parents?.length && (
      <div className="mt-2">
        <div className="text-xs text-gray-400 uppercase mb-1">Parents</div>
        <MatchesTableView
          matches={match.parents}
          className="flex flex-row gap-2 bg-gray-600 rounded-md p-2"
        />
      </div>
    )}
  </div>
);

export default MatchListItem;