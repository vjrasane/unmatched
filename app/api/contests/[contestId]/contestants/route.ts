import { NextRequest, NextResponse } from "next/server";
import { ContestantInput } from "@/schema/contest";
import { Contestant } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import { getToken } from "next-auth/jwt";

const createContestant = async (
  { name, imageSrc }: ContestantInput,
  contestId: string,
  creatorId: string
): Promise<Contestant> => {
  return await prismadb.contestant.create({
    data: {
      name,
      imageSrc,
      contest: {
        connect: {
          id: contestId,
          creatorId,
        },
      },
    },
  });
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { contestId: string } }
) => {
  try {
    const token = await getToken({ req });
    if (!token?.id) return new NextResponse("Unauthorized", { status: 401 });

    const data = await req.json();
    const result = ContestantInput.safeParse(data);
    if (!result.success)
      return new NextResponse(result.error.toString(), { status: 400 });

    const { contestId } = params;
    const contestant = await createContestant(result.data, contestId, token.id);
    return NextResponse.json(contestant);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
