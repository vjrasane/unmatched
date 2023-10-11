import { AspectRatio } from "@/components/ui/aspect-ratio";
import { TableCell, TableRow } from "@/components/ui/table";
import { capitalize } from "@/lib/utils";
import { Contestant } from "@prisma/client";
import Image from "next/image";
import { FunctionComponent } from "react";

const ContestantRow: FunctionComponent<{
  contestant: Contestant;
  children?: React.ReactNode;
}> = async ({ contestant, children }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <AspectRatio ratio={4 / 3}>
          <Image
            className="rounded-md object-cover"
            src={contestant.imageSrc}
            alt={contestant.name}
            fill
          />
        </AspectRatio>
      </TableCell>
      <TableCell>{capitalize(contestant.name)}</TableCell>
      <TableCell>{contestant.elo}</TableCell>
      <TableCell>{children}</TableCell>
    </TableRow>
  );
};

export default ContestantRow;
