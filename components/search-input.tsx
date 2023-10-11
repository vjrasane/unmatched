"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEventHandler, useEffect, useState } from "react";
import useDebouncedValue from "@/hooks/use-debounced-value";
import qs from "query-string";

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search");

  const [value, setValue] = useState(search ?? "");

  const debounced = useDebouncedValue(value, 500);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setValue(e.target.value);

  useEffect(() => {
    const query = {
      search: debounced,
    };

    const url = qs.stringifyUrl(
      { url: window.location.pathname, query },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  }, [router, debounced]);

  return (
    <div className="relative">
      <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-10 bg-primary/10"
        onChange={onChange}
      />
    </div>
  );
};

export default SearchInput;
