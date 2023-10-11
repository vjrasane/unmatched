import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { MatchWithContestants } from "@/schema/match";
import { Contestant } from "@prisma/client";
import { sampleSize, times } from "lodash/fp";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const createMatch = async (
  contestId: string,
  creatorId: string
): Promise<MatchWithContestants> => {
  return await prismadb.$transaction(async (tx) => {
    const count = await tx.contestant.count({
      where: {
        contestId,
      },
    });
    if (count < 2) throw new Error("Not enough contestants");

    const indices = sampleSize(
      2,
      times((i) => i, count)
    );

    const contestants = await Promise.all(
      indices.map((idx) =>
        tx.contestant.findFirst({
          where: {
            contestId,
          },
          skip: idx,
        })
      )
    );

    const match = await tx.match.create({
      data: {
        contestId,
        creatorId,
        contestants: {
          create: contestants
            .filter((c): c is Contestant => c != null)
            .map(({ id }) => ({
              contestantId: id,
            })),
        },
      },
      include: {
        contestants: {
          select: {
            contestant: true,
          },
        },
      },
    });

    return {
      ...match,
      contestants: match.contestants.map(({ contestant }) => contestant),
    };
  });
};

export const POST = async (
  _: NextRequest,
  { params }: { params: { contestId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 400 });

    const { contestId } = params;
    const match = await createMatch(contestId, session.user.id);
    return NextResponse.json(match);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
