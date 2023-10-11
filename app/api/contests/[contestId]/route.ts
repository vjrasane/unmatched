import { NextRequest, NextResponse } from "next/server";
import { ContestInput } from "@/schema/contest";
import { Contest } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import { getToken } from "next-auth/jwt";

const updateContest = async (
  { name, description, imageSrc }: ContestInput,
  contestId: string,
  creatorId: string
): Promise<Contest> => {
  return await prismadb.contest.update({
    where: {
      id: contestId,
      creatorId,
    },
    data: {
      name,
      description,
      imageSrc,
    },
  });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { contestId: string } }
) => {
  try {
    const token = await getToken({ req });
    if (!token?.id) return new NextResponse("Unauthorized", { status: 401 });

    const data = await req.json();
    const result = ContestInput.safeParse(data);
    if (!result.success)
      return new NextResponse(result.error.toString(), { status: 400 });

    const { contestId } = params;
    const contest = await updateContest(result.data, contestId, token.id);
    return NextResponse.json(contest);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
