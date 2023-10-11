import { Contest, Contestant, PrismaClient } from "@prisma/client";
import axios from "axios";
import { z } from "zod";

const db = new PrismaClient();

const Card = z.object({
  name: z.string(),
  real_name: z.string(),
  type_code: z.string(),
  type_name: z.string(),
  imagesrc: z.string().optional(),
});

const getContest = async (): Promise<
  Contest & { contestants: Contestant[] }
> => {
  const existingContest = await db.contest.findFirst({
    where: {
      name: "Arkham Investigators",
    },
    include: {
      contestants: true,
    },
  });

  if (existingContest) return existingContest;
  return await db.contest.create({
    data: {
      name: "Arkham Investigators",
      description: "Who is the best investigator?",
      imageSrc:
        "https://hallofheroeshome.files.wordpress.com/2020/04/tts4-1.jpg",
    },
    include: {
      contestants: true,
    },
  });
};

const getCards = async () => {
  const { data } = await axios.get("https://arkhamdb.com/api/public/cards/");

  const cards = z.array(Card).parse(data);
  return cards;
};

export const createArkhamInvestigatorsContest = async () => {
  try {
    const [contest, cards] = await Promise.all([getContest(), getCards()]);

    const investigators = cards
      .filter((card) => card.type_code === "investigator")
      .filter((card) => !!card.imagesrc)
      .filter(
        (card) =>
          !contest.contestants.some(
            (contestant) => contestant.name === card.real_name
          )
      );

    await db.contestant.createMany({
      data: investigators.map((card) => ({
        name: card.real_name,
        imageSrc: `https://arkhamdb.com/${card.imagesrc}`,
        contestId: contest.id,
      })),
    });
  } catch (err) {
    console.error("Error creating Arkham Investigators Contest", err);
  } finally {
    await db.$disconnect();
  }
};
