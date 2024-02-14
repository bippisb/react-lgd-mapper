import { Radio, Typography } from "@material-tailwind/react";
import { ILGDMatch } from "../types";
import { FC } from "react";
import MatchListItem from "./MatchListItem";

export interface MatchesTableViewProps {
  matches: ILGDMatch[];
  node: string;
  onSelect: (m: ILGDMatch) => void;
}

export const MatchesTableView: FC<MatchesTableViewProps> = ({
  matches,
  node,
  onSelect,
}) => (
  <div>
    {matches.map((m) => (
      <div
        key={m.id}
        className="border-gray-300 border-2 p-1 rounded-lg"
        onClick={() => onSelect(m)}
      >
        <Radio
          label={
            <Typography
              className="uppercase font-extrabold ml-3 "
              placeholder={undefined}
            >
              {" "}
              {m.name}
            </Typography>
          }
          crossOrigin={undefined}
          className="checked:accent-gray-500"
        />
        <div className="ml-6 -mt-2">
          <MatchListItem match={m} />
        </div>
      </div>
    ))}
  </div>
);
