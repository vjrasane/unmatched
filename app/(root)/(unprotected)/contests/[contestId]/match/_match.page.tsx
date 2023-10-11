import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import prismadb from "@/lib/prismadb";
import { Contest } from "@prisma/client";
import { object, string } from "decoders";
import { redirect } from "next/navigation";
import { FunctionComponent } from "react";
import MatchDisplay from "./_match-display.component";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const getContest = async (id: string): Promise<Contest | null> => {
  const contest = await prismadb.contest.findUnique({
    where: { id },
  });
  return contest;
};

const ContestBanner: FunctionComponent<{
  contestId: string;
}> = async ({ contestId }) => {
  const contest = await getContest(contestId);
  if (!contest) return redirect("/");

  return (
    <div className="w-full flex flex-col gap-3 mb-3">
      <div className="text-md text-secondary-foreground">{contest.name}</div>
      <Link href={`/contests/${contestId}`}>
        <AspectRatio ratio={15 / 2}>
          <Image
            className="rounded-md object-cover hover:opacity-75 cursor-pointer"
            src={contest.imageSrc}
            alt={contest.name}
            fill
          />
        </AspectRatio>
      </Link>
      <div className="text-xl md:text-3xl text-center">
        {contest.description}
      </div>
    </div>
  );
};

const MatchPage: FunctionComponent<{
  params: {
    contestId: string;
  };
}> = async (props) => {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const result = object({
    params: object({
      contestId: string,
    }),
  }).decode(props);
  if (!result.ok) return redirect("/");
  const { params } = result.value;

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <ContestBanner contestId={params.contestId} />
      <MatchDisplay contestId={params.contestId} />
    </div>
  );
};

export default MatchPage;
