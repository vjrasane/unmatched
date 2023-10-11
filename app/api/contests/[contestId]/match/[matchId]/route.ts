import prismadb from "@/lib/prismadb";
import { MatchResult } from "@/schema/match";
import { NextRequest, NextResponse } from "next/server";
import EloRank from "elo-rank";
import { first, partition } from "lodash/fp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";

const elo = new EloRank();

const getNewRatings = (winner: number, loser: number): [number, number] => {
  const expectedWinnerScore = elo.getExpected(winner, loser);
  const expectedLoserScore = elo.getExpected(loser, winner);

  return [
    elo.updateRating(expectedWinnerScore, 1, winner),
    elo.updateRating(expectedLoserScore, 0, loser),
  ];
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
            contestant: true,
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

    const [winnerElo, loserElo] = getNewRatings(winner.elo, loser.elo);

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
