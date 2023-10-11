import { Contest, Contestant } from "@prisma/client";
import { z } from "zod";
import { Paginated } from "./pagination";

const ContestInput = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  imageSrc: z.string().url("Image must be a valid URL"),
});

type ContestInput = z.infer<typeof ContestInput>;

type ContestWithCount = Contest & {
  _count: {
    contestants: number;
  };
};

type ContestWithContestants = Contest & {
  contestants: Paginated<Contestant>;
};

const ContestantInput = z.object({
  name: z.string().min(1, "Name is required"),
  imageSrc: z.string().url("Image must be a valid URL"),
});

type ContestantInput = z.infer<typeof ContestantInput>;

type ContestantWithMatches = Contestant & {
  _count: {
    matches: number;
  };
};

export {
  ContestInput,
  type ContestWithCount,
  type ContestWithContestants,
  ContestantInput,
  type ContestantWithMatches,
};
