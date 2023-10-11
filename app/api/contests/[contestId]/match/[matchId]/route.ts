import prismadb from "@/lib/prismadb";
import { MatchResult } from "@/schema/match";
import { NextRequest, NextResponse } from "next/server";

import { first, partition } from "lodash/fp";
import { getToken } from "next-auth/jwt";
import { ContestantWithMatches } from "@/schema/contest";

const MAX_ELO_CHANGE = 128;
const MIN_ELO_CHANGE = 4;
const CHANGE_RATE = 0.25;

const exponential = (
  games: number,
  max: number,
  min: number,
  rate: number
): number => {
  return (max - min) / (rate * games + 1) + min;
};

const getExpected = (a: number, b: number) => {
  const exp = (b - a) / 400;
  return 1 / (1 + Math.pow(10, exp));
};

const getRating = (
  current: number,
  expected: number,
  result: number,
  k: number = 32
) => {
  return current + k * (result - expected);
};

const elo = (
  a: number,
  b: number,
  result: 1 | 0.5,
  ak: number = 32,
  bk: number = 32
): [number, number] => {
  const ea = getExpected(a, b);
  const eb = getExpected(b, a);

  const ar = getRating(a, ea, result, ak);
  const br = getRating(b, eb, 1 - result, bk);

  return [ar, br];
};

const getNewRatings = (
  winner: ContestantWithMatches,
  loser: ContestantWithMatches
): [number, number] => {
  const winnerK = exponential(
    winner._count.matches,
    MAX_ELO_CHANGE,
    MIN_ELO_CHANGE,
    CHANGE_RATE
  );
  const loserK = exponential(
    loser._count.matches,
    MAX_ELO_CHANGE,
    MIN_ELO_CHANGE,
    CHANGE_RATE
  );

  return elo(winner.elo, loser.elo, 1, winnerK, loserK);
};

const updateMatchWinner = async (
  creatorId: string,
  contestId: string,
  matchId: string,
  winnerId: string
) => {
  return await prismadb.$transaction(async (tx) => {
    const match = await tx.match.findUnique({
      where: { id: matchId, creatorId, contestId },
      include: {
        contestants: {
          select: {
            contestant: {
              include: {
                _count: {
                  select: {
                    matches: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!match) throw new Error("Match not found");

    const [winners, losers] = partition(
      (c) => c.id === winnerId,
      match.contestants.map(({ contestant }) => contestant)
    );

    const [winner, loser] = [first(winners), first(losers)];
    if (winner == null || loser == null)
      throw new Error(`Ambiguous winner/loser`);

    const [winnerElo, loserElo] = getNewRatings(winner, loser);

    await tx.contestant.update({
      where: {
        id: winner.id,
      },
      data: {
        elo: winnerElo,
      },
    });

    await tx.contestant.update({
      where: {
        id: loser.id,
      },
      data: {
        elo: loserElo,
      },
    });

    return await tx.match.update({
      where: { id: matchId, creatorId, contestId },
      data: {
        winnerId,
      },
      include: {
        contestants: {
          select: {
            contestant: true,
          },
        },
      },
    });
  });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { contestId: string; matchId: string } }
) => {
  try {
    const token = await getToken({ req });
    if (!token?.id) return new NextResponse("Unauthorized", { status: 400 });

    const data = await req.json();
    const result = MatchResult.safeParse(data);
    if (!result.success)
      return new NextResponse(result.error.toString(), { status: 400 });

    const { winnerId } = result.data;
    const { contestId, matchId } = params;
    const match = await updateMatchWinner(
      token.id,
      contestId,
      matchId,
      winnerId
    );
    return NextResponse.json(JSON.stringify(match));
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
