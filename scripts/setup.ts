import { createDcContest } from "./createDcContest";
import { createMarvelContest } from "./createMarvelContest";
import { createPokemonContest } from "./createPokemonContest";

const main = async () => {
  try {
    await Promise.all([
      createMarvelContest(),
      createPokemonContest(),
      createDcContest(),
    ]);
  } catch (err) {
    console.log("Setup failed: ", err);
    process.exit(1);
  } finally {
  }
};

main();
