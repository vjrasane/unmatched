import { NextRequest, NextResponse } from "next/server";
import { Contestant } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import { getToken } from "next-auth/jwt";
import { ContestantInput } from "@/schema/contest";

const updateContestant = async (
  { name, imageSrc }: ContestantInput,
  contestId: string,
  contestantId: string,
  creatorId: string
): Promise<Contestant> => {
  return await prismadb.contestant.update({
    where: {
      id: contestantId,
      contest: {
        id: contestId,
        creatorId,
      },
    },
    data: {
      name,
      imageSrc,
    },
  });
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { contestId: string; contestantId: string } }
) => {
  try {
    const token = await getToken({ req });
    if (!token?.id) return new NextResponse("Unauthorized", { status: 401 });

    const data = await req.json();
    const result = ContestantInput.safeParse(data);
    if (!result.success)
      return new NextResponse(result.error.toString(), { status: 400 });

    const { contestId, contestantId } = params;
    const contestant = await updateContestant(
      result.data,
      contestId,
      contestantId,
      token.id
    );
    return NextResponse.json(contestant);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
};

const deleteContestant = async (
  contestId: string,
  contestantId: string,
  creatorId: string
): Promise<Contestant> => {
  return await prismadb.contestant.delete({
    where: {
      id: contestantId,
      contest: {
        id: contestId,
        creatorId,
      },
    },
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { contestId: string; contestantId: string } }
) => {
  try {
    const token = await getToken({ req });
    if (!token?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { contestId, contestantId } = params;
    const contestant = await deleteContestant(
      contestId,
      contestantId,
      token.id
    );
    return NextResponse.json(contestant);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
