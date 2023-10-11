import { Contest, Contestant, PrismaClient } from "@prisma/client";
import axios from "axios";
import { z } from "zod";

const db = new PrismaClient();

const Hero = z.object({
  id: z.number(),
  name: z.string(),
  biography: z.object({
    alignment: z.string().nullable(),
    publisher: z.string().nullable(),
  }),
  images: z.object({
    md: z.string().url(),
  }),
});

const getContest = async (): Promise<
  Contest & { contestants: Contestant[] }
> => {
  const existingContest = await db.contest.findFirst({
    where: {
      name: "DC Heroes",
    },
    include: {
      contestants: true,
    },
  });

  if (existingContest) return existingContest;
  return await db.contest.create({
    data: {
      name: "DC Heroes",
      description: "Who is the strongest hero?",
      imageSrc:
        "https://images.thedirect.com/media/article_full/dc-new-justice-league.jpg",
    },
    include: {
      contestants: true,
    },
  });
};

const getHeroes = async () => {
  const { data } = await axios.get(
    "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json"
  );

  const heroes = z.array(Hero).parse(data);
  return heroes;
};

export const createDcContest = async () => {
  try {
    const [contest, heroes] = await Promise.all([getContest(), getHeroes()]);

    const dcHeroes = heroes
      .filter((hero) => hero.biography.publisher === "DC Comics")
      .filter((hero) => hero.biography.alignment === "good")
      .filter(
        (hero) =>
          !contest.contestants.some(
            (contestant) => contestant.name === hero.name
          )
      );

    await db.contestant.createMany({
      data: dcHeroes.map((hero) => ({
        name: hero.name,
        imageSrc: hero.images.md,
        contestId: contest.id,
      })),
    });
  } catch (err) {
    console.error("Error creating DC Contest", err);
  } finally {
    await db.$disconnect();
  }
};
