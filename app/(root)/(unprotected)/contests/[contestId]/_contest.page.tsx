import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prismadb from "@/lib/prismadb";
import { Page, paginated, paginationParams } from "@/schema/pagination";
import { Contest, Contestant } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { FunctionComponent, Suspense } from "react";
import PaginationControls from "@/components/pagination-controls";
import { object, string } from "decoders";
import SearchInput from "@/components/search-input";
import MatchButton from "@/components/match-button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ContestWithContestants } from "@/schema/contest";
import AddContestant from "@/components/add-contestant";
import ContestantControlRow from "@/components/contestant-control-row";
import ContestantRow from "@/components/contestant-row";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const getContest = async (id: string) => {
  const contest = await prismadb.contest.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          contestants: true,
        },
      },
    },
  });
  return contest;
};

const getContestants = async (
  id: string,
  search: string | undefined,
  { page, size }: Page
): Promise<ContestWithContestants | null> => {
  const contest = await prismadb.contest.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          contestants: {
            where: {
              name: { contains: search },
            },
          },
        },
      },
      contestants: {
        where: {
          name: { contains: search },
        },
        orderBy: [{ elo: "desc" }, { name: "asc" }],
        take: size,
        skip: page * size,
      },
    },
  });
  if (!contest) return contest;

  return {
    ...contest,
    contestants: paginated(contest.contestants, contest._count.contestants, {
      page,
      size,
    }),
  };
};

const ContestantTable: FunctionComponent<{
  contest: Contest;
  contestants: Contestant[];
}> = async ({ contest, contestants }) => {
  const session = await getServerSession(authOptions);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]"></TableHead>
          <TableHead>Contestant</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contestants.map((c) => {
          if (session?.user.id === contest.creatorId)
            return (
              <ContestantControlRow
                key={c.id}
                contest={contest}
                contestant={c}
              />
            );
          return <ContestantRow key={c.id} contestant={c} />;
        })}
      </TableBody>
    </Table>
  );
};

const ContestantsData: FunctionComponent<{
  contestId: string;
  search: string | undefined;
  page: Page;
}> = async ({ contestId, search, page }) => {
  const session = await getServerSession(authOptions);
  const contest = await getContestants(contestId, search, page);
  if (!contest) return redirect("/");

  const { contestants } = contest;

  return (
    <>
      {session?.user.id === contest.creatorId ? (
        <AddContestant contest={contest} />
      ) : null}
      {(() => {
        if (!contestants.data.length)
          return (
            <div className="w-full text-center pt-2">No results found!</div>
          );
        return (
          <>
            <ContestantTable contest={contest} contestants={contestants.data} />
            <PaginationControls paginated={contestants} />
          </>
        );
      })()}
    </>
  );
};

const ContestBanner: FunctionComponent<{
  contestId: string;
}> = async ({ contestId }) => {
  const session = await getServerSession(authOptions);
  const contest = await getContest(contestId);
  if (!contest) return redirect("/");

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-center px-2">
        <div>
          <div className="text-5xl">{contest.name}</div>
          <div className="text-md">{contest.description}</div>
        </div>
        <div>
          {session?.user.id === contest.creatorId ? (
            <Link href={`/contests/${contest.id}/edit`}>
              <Button className="gap-2">
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            </Link>
          ) : null}
          {!!session && contest._count.contestants >= 2 ? (
            <MatchButton contestId={contest.id} />
          ) : null}
        </div>
      </div>
      <AspectRatio ratio={5 / 2}>
        <Image
          className="rounded-md object-cover"
          src={contest.imageSrc}
          alt={contest.name}
          fill
        />
      </AspectRatio>
    </div>
  );
};

const ContestPage: FunctionComponent<{
  params: {
    contestId: string;
  };
  searchParams: {
    page: string | undefined;
    size: string | undefined;
  };
}> = async (props) => {
  const result = object({
    params: object({
      contestId: string,
    }),
    searchParams: paginationParams(14),
  }).decode(props);

  if (!result.ok) return redirect("/");
  const { params, searchParams } = result.value;

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <ContestBanner contestId={params.contestId} />
      <SearchInput />
      <Suspense fallback={<div>Loading</div>}>
        <ContestantsData
          contestId={params.contestId}
          search={searchParams.search}
          page={{
            size: searchParams.size,
            page: searchParams.page,
          }}
        />
      </Suspense>
    </div>
  );
};

export default ContestPage;
