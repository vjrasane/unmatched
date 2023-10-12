import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import prismadb from "@/lib/prismadb";
import { Page, Paginated, paginated } from "@/schema/pagination";
import { FunctionComponent } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from "next/link";
import MatchButton from "@/components/match-button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PlusCircleIcon } from "lucide-react";
import { ContestWithCount } from "@/schema/contest";

const getContests = async (
  search: string | undefined,
  { page, size }: Page
): Promise<Paginated<ContestWithCount>> => {
  const [total, contests] = await prismadb.$transaction([
    prismadb.contest.count(),
    prismadb.contest.findMany({
      where: { name: { search } },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            contestants: true,
          },
        },
      },
      take: size,
      skip: page * size,
    }),
  ]);

  return paginated(contests, total, {
    page,
    size,
  });
};

const ContestCard: FunctionComponent<{
  contest: ContestWithCount;
}> = async ({ contest }) => {
  const session = await getServerSession(authOptions);
  return (
    <Card className="flex flex-col cursor-pointer hover:bg-secondary/75 transition-colors">
      <Link href={`/contests/${contest.id}`}>
        <CardHeader>
          <CardTitle>{contest.name}</CardTitle>
          <CardDescription>{contest.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AspectRatio ratio={16 / 9}>
            <Image
              className="rounded-md object-cover"
              src={contest.imageSrc}
              alt={contest.name}
              fill
            />
          </AspectRatio>
        </CardContent>
      </Link>
      <CardFooter className="grow flex justify-center items-end">
        {!!session && contest._count.contestants >= 2 ? (
          <MatchButton contestId={contest.id} />
        ) : null}
      </CardFooter>
    </Card>
  );
};

const CreateContestCard: FunctionComponent = () => {
  return (
    <Card className="cursor-pointer hover:bg-secondary/50">
      <Link href={`/contests/create`} className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Create New</CardTitle>
          <CardDescription>Create your own contest!</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <AspectRatio ratio={16 / 9}>
            <div
              className="flex justify-center items-center w-full h-full
          border-2
          border-dashed
          rounded-md
          border-primary
          opacity-50"
            >
              <PlusCircleIcon className="w-12 h-12" />
            </div>
          </AspectRatio>
        </CardContent>
      </Link>
    </Card>
  );
};

const ContestsGrid: FunctionComponent<{
  contests: ContestWithCount[];
}> = async ({ contests }) => {
  const session = await getServerSession(authOptions);
  return (
    <div className="grid grid-cols-1 min-[500px]:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {session && <CreateContestCard />}
      {contests.map((c) => (
        <ContestCard key={c.id} contest={c} />
      ))}
    </div>
  );
};

const ContestsPage: FunctionComponent<{
  searchParams: {
    search: string | undefined;
    page: number | undefined;
  };
}> = async ({ searchParams: { page, search } }) => {
  const contests = await getContests(search, { page: page ?? 0, size: 20 });

  return (
    <div className="h-full w-full p-2  mx-auto">
      <ContestsGrid contests={contests.data} />
    </div>
  );
};

export default ContestsPage;
