
import { List, ListItem, Radio, Typography } from "@material-tailwind/react";
import { ILGDMatch } from "../types";
import { FC } from "react";

export interface MatchesTableViewProps {
    matches: ILGDMatch[];
    node: string;
    onSelect: (m: ILGDMatch) => void;
}


export const MatchesTableView: FC<MatchesTableViewProps> = ({ matches, node, onSelect }) => (
    <div className="flex flex-col border border-slate-400">
        {
            matches.map(m => (
                <div key={m.id} className="border-gray-300 border-2 p-1 rounded-lg" onClick={() => onSelect(m)}>
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
                        <List className="block" placeholder={undefined}>
                            <ListItem placeholder={undefined}>Enitity Id - {m.id}</ListItem>
                            <ListItem placeholder={undefined}>LGD Code - {m.code}</ListItem>
                            <ListItem placeholder={undefined}>Level Name - {m.level}</ListItem>
                            <ListItem placeholder={undefined}>Level Id - {m.level_id}</ListItem>
                        </List>
                    </div>

                </div>
            )
            )
        }
    </div>
);
