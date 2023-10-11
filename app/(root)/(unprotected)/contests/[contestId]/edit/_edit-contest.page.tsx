import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ContestForm from "@/components/contest-form";
import prismadb from "@/lib/prismadb";
import { object, string } from "decoders";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { FunctionComponent } from "react";

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

const EditContestPage: FunctionComponent<{
  params: {
    contestId: string;
  };
}> = async (props) => {
  const result = object({
    params: object({
      contestId: string,
    }),
  }).decode(props);
  if (!result.ok) return redirect("/");
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/");

  const {
    params: { contestId },
  } = result.value;
  const contest = await getContest(contestId);
  if (!contest) return redirect("/");

  if (session.user.id !== contest.creatorId) return redirect("/");

  return <ContestForm initialData={contest} />;
};

export default EditContestPage;
