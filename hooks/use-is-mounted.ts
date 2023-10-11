import { useEffect, useRef, useState } from "react";

const useIsMounted = () => {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  return mounted.current;
};

export default useIsMounted;
