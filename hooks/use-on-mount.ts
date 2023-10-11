import { useEffect, useRef } from "react";

const useOnMount = (effect: React.EffectCallback) => {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    return effect();
  }, [effect]);
};

export default useOnMount;
