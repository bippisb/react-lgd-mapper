import { List, ListItem, Radio, Typography } from "@material-tailwind/react";
import { ILGDMatch } from "../types";
import { FC } from "react";

export interface MatchListItemProps {
  match: ILGDMatch;
}

const MatchListItem: FC<MatchListItemProps> = ({ match }) => (
  <div>
    <List className="block" placeholder={undefined}>
      <ListItem placeholder={undefined}>Enitity Id - {match.id}</ListItem>
      <ListItem placeholder={undefined}>LGD Code - {match.code}</ListItem>
      <ListItem placeholder={undefined}>Level Name - {match.level}</ListItem>
      <ListItem placeholder={undefined}>Level Id - {match.level_id}</ListItem>
    </List>
  </div>
);

export default MatchListItem;
