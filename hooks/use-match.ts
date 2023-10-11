import { MatchWithContestants } from "@/schema/match";
import { Result, failure, loading, standby, success } from "@/schema/result";
import axios from "axios";
import { useCallback, useState } from "react";
import useOnMount from "./use-on-mount";

const useMatch = (contestId: string) => {
  const [match, setMatch] = useState<Result<MatchWithContestants>>(standby);

  const createMatch = useCallback(async () => {
    try {
      setMatch(loading);
      const result = await axios.post(`/api/contests/${contestId}/match`, {});
      setMatch(success(result.data));
    } catch (err) {
      setMatch(failure(err));
    }
  }, [setMatch, contestId]);

  useOnMount(() => {
    createMatch();
  });

  return [match, createMatch] as const;
};

export default useMatch;
