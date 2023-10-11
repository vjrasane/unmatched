import { NextRequest, NextResponse } from "next/server";
import { ContestInput } from "@/schema/contest";
import { Contest } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import { getToken } from "next-auth/jwt";

const createContest = async (
  { name, description, imageSrc }: ContestInput,
  creatorId: string
): Promise<Contest> => {
  return await prismadb.contest.create({
    data: {
      creatorId,
      name,
      description,
      imageSrc,
    },
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const token = await getToken({ req });
    if (!token?.id) return new NextResponse("Unauthorized", { status: 401 });

    const data = await req.json();
    const result = ContestInput.safeParse(data);
    if (!result.success)
      return new NextResponse(result.error.toString(), { status: 400 });

    const match = await createContest(result.data, token.id);
    return NextResponse.json(match);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
};
