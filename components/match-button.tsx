import Link from "next/link";
import { Button } from "./ui/button";
import { Swords } from "lucide-react";
import { FunctionComponent } from "react";

const MatchButton: FunctionComponent<{
  contestId: string;
}> = ({ contestId }) => {
  return (
    <Link href={`/contests/${contestId}/match`}>
      <Button variant="destructive" className="flex justify-center gap-2 w-36">
        <Swords />
        <div>Match!</div>
      </Button>
    </Link>
  );
};

export default MatchButton;
