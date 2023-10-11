import { Contest, Contestant, PrismaClient } from "@prisma/client";
import axios from "axios";
import { chunk } from "lodash/fp";
import { z } from "zod";

const db = new PrismaClient();

const Pokemon = z.object({
  name: z.string(),
  url: z.string().url(),
});

type Pokemon = z.infer<typeof Pokemon>;

const PokemonDetails = z.object({
  sprites: z.object({
    front_default: z.string().url().nullable(),
    front_shiny: z.string().url().nullable(),
  }),
});

const getContest = async (): Promise<
  Contest & { contestants: Contestant[] }
> => {
  const existingContest = await db.contest.findFirst({
    where: {
      name: "Pokémon",
    },
    include: {
      contestants: true,
    },
  });

  if (existingContest) return existingContest;
  return await db.contest.create({
    data: {
      name: "Pokémon",
      description: "Which Pokémon is the best?",
      imageSrc:
        "https://www.theouterhaven.net/wp-content/uploads/2023/06/pokemon-940x529-1.jpg",
    },
    include: {
      contestants: true,
    },
  });
};

const getPokemon = async () => {
  const { data } = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?limit=2000"
  );

  const pokemon = z
    .object({
      results: z.array(Pokemon),
    })
    .parse(data);
  return pokemon.results;
};

const getImage = async (
  pokemon: Pokemon
): Promise<Pokemon & { imageSrc: string | null }> => {
  const { data } = await axios.get(pokemon.url);
  const details = PokemonDetails.parse(data);
  return { ...pokemon, imageSrc: details.sprites.front_default };
};

export const createPokemonContest = async () => {
  try {
    const [contest, pokemon] = await Promise.all([getContest(), getPokemon()]);

    const missingPokemon = pokemon.filter(
      (p) =>
        !contest.contestants.some((contestant) => contestant.name === p.name)
    );

    const batches = chunk(10, missingPokemon);

    for (let batch of batches) {
      const images = await Promise.all(batch.map(getImage));
      await db.contestant.createMany({
        data: images
          .filter(
            (p): p is Pokemon & { imageSrc: string } => p.imageSrc != null
          )
          .map((p) => ({
            name: p.name,
            imageSrc: p.imageSrc,
            contestId: contest.id,
          })),
      });
    }
  } catch (err) {
    console.error("Error creating Pokémon contest", err);
  } finally {
    await db.$disconnect();
  }
};
