import { Contestant, Match } from "@prisma/client";
import { z } from "zod";

const MatchResult = z.object({
  winnerId: z.string(),
});

type MatchResult = z.infer<typeof MatchResult>;

type MatchWithContestants = Match & { contestants: Contestant[] };

export { type MatchWithContestants, MatchResult };
