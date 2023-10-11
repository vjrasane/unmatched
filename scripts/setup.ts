import { createArkhamInvestigatorsContest } from "./createArkhamInvestigatorContest";
import { createArkhamPlayerCardContest } from "./createArkhamPlayerCardsContest";
import { createDcContest } from "./createDcContest";
import { createMarvelContest } from "./createMarvelContest";
import { createPokemonContest } from "./createPokemonContest";

const main = async () => {
  try {
    await Promise.all([
      createMarvelContest(),
      createPokemonContest(),
      createDcContest(),
      createArkhamInvestigatorsContest(),
      createArkhamPlayerCardContest(),
    ]);
  } catch (err) {
    console.log("Setup failed: ", err);
    process.exit(1);
  } finally {
  }
};

main();
