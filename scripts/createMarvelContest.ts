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
      name: "Marvel Heroes",
    },
    include: {
      contestants: true,
    },
  });

  if (existingContest) return existingContest;
  return await db.contest.create({
    data: {
      name: "Marvel Heroes",
      description: "Who is the strongest hero?",
      imageSrc:
        "https://static.independent.co.uk/s3fs-public/thumbnails/image/2014/08/07/15/marvel.jpg?quality=75&width=990&crop=3%3A2%2Csmart&auto=webp",
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

export const createMarvelContest = async () => {
  try {
    const [contest, heroes] = await Promise.all([getContest(), getHeroes()]);

    const marvelHeroes = heroes
      .filter((hero) => hero.biography.publisher === "Marvel Comics")
      .filter((hero) => hero.biography.alignment === "good")
      .filter(
        (hero) =>
          !contest.contestants.some(
            (contestant) => contestant.name === hero.name
          )
      );

    await db.contestant.createMany({
      data: marvelHeroes.map((hero) => ({
        name: hero.name,
        imageSrc: hero.images.md,
        contestId: contest.id,
      })),
    });
  } catch (err) {
    console.error("Error creating Marvel Contest", err);
  } finally {
    await db.$disconnect();
  }
};
