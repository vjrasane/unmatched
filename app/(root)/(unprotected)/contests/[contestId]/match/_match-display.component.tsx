"use client";

import useMatch from "@/hooks/use-match";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";
import { Contestant, Match } from "@prisma/client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FunctionComponent } from "react";
import Image from "next/image";
import { capitalize } from "@/lib/utils";

const WinnerCard: FunctionComponent<{
  contestant: Contestant;
}> = ({ contestant }) => {
  return (
    <Card className={"w-48 sm:w-64 md:w-72 transition-all bg-secondary"}>
      <CardHeader>
        <CardTitle className="text-center">
          {capitalize(contestant.name)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AspectRatio ratio={3 / 5}>
          <Image
            className="rounded-md object-cover"
            src={contestant.imageSrc}
            alt={contestant.name}
            fill
          />
        </AspectRatio>
      </CardContent>
    </Card>
  );
};

const ContestantCard: FunctionComponent<{
  contestant: Contestant;
  onClick: () => void;
}> = ({ onClick, contestant }) => {
  return (
    <Card
      className={
        "w-48 sm:w-64 md:w-72 transition-all cursor-pointer hover:bg-secondary/50 hover:scale-105"
      }
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-center">
          {capitalize(contestant.name)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AspectRatio ratio={3 / 5}>
          <Image
            className="rounded-md object-cover"
            src={contestant.imageSrc}
            alt={contestant.name}
            fill
          />
        </AspectRatio>
      </CardContent>
    </Card>
  );
};

const MatchChoice: FunctionComponent<{
  onChoice: (c: Contestant) => void;
  contestants: Contestant[];
}> = ({ onChoice, contestants }) => {
  return (
    <>
      {contestants.map((c) => (
        <ContestantCard key={c.id} contestant={c} onClick={() => onChoice(c)} />
      ))}
    </>
  );
};

const MatchDisplay: FunctionComponent<{
  contestId: string;
}> = ({ contestId }) => {
  const [match, onNext] = useMatch(contestId);
  const [winner, setWinner] = useState<Contestant | undefined>();

  const { toast } = useToast();

  const onChoice = async ({ contestId, id }: Match, contestant: Contestant) => {
    try {
      setWinner(contestant);
      await Promise.all([
        axios.patch(`/api/contests/${contestId}/match/${id}`, {
          winnerId: contestant.id,
        }),
        onNext(),
      ]);
      setWinner(undefined);
    } catch (error) {
      toast({
        title: "Something went wrong!",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {(() => {
        if (winner) return <WinnerCard contestant={winner} />;
        switch (match.tag) {
          case "loading":
            return <Spinner />;
          case "failure":
            return <code>{JSON.stringify(match.error)}</code>;
          case "success": {
            const { contestants } = match.data;
            return (
              <MatchChoice
                onChoice={(c) => onChoice(match.data, c)}
                contestants={contestants}
              />
            );
          }
          default:
            return null;
        }
      })()}
    </div>
  );
};

export default MatchDisplay;
