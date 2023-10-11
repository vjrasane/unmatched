import { Contest, Contestant, PrismaClient } from "@prisma/client";
import axios from "axios";
import { uniqBy } from "lodash/fp";
import { z } from "zod";

const db = new PrismaClient();

const Card = z.object({
  code: z.string(),
  name: z.string(),
  subname: z.string().optional(),
  real_name: z.string(),
  type_code: z.string(),
  type_name: z.string(),
  imagesrc: z.string().optional(),
  xp: z.number().optional(),
});

const getContest = async (): Promise<
  Contest & { contestants: Contestant[] }
> => {
  const existingContest = await db.contest.findFirst({
    where: {
      name: "Arkham Player Cards",
    },
    include: {
      contestants: true,
    },
  });

  if (existingContest) return existingContest;
  return await db.contest.create({
    data: {
      name: "Arkham Player Cards",
      description: "Which player card is the best?",
      imageSrc:
        "https://www.goodgames.com.au/wp-content/uploads/2021/11/SCREEN-Arkham-Horror-LCG-768x432.jpg",
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

export const createArkhamPlayerCardContest = async () => {
  try {
    const [contest, cards] = await Promise.all([getContest(), getCards()]);

    const playerCards = cards
      .filter((card) => ["asset", "event", "skill"].includes(card.type_code))
      .filter((card) => !!card.imagesrc)
      .filter(
        (card) =>
          !contest.contestants.some(
            (contestant) => contestant.name === card.real_name
          )
      );
    const uniquePlayerCards = uniqBy((card) => card.code, playerCards);

    await db.contestant.createMany({
      data: uniquePlayerCards.map((card) => ({
        name: `${card.real_name}${card.xp ? ` (${card.xp})` : ""}${
          card.subname ? `: ${card.subname}` : ""
        }`,
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
