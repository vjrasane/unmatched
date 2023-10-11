"use client";

import { PropsWithChildren } from "react";
import { Button } from "./ui/button";
import { Paginated } from "@/schema/pagination";
import { useRouter } from "next/navigation";

import qs from "query-string";

const PaginationControls = function <T>({
  paginated,
}: PropsWithChildren<{
  paginated: Paginated<T>;
}>): React.ReactNode {
  const router = useRouter();

  const isFirst = paginated.page === 0;
  const isLast = paginated.page === paginated.pages - 1;

  const onPageChange = (page: number) => {
    const query = {
      page,
    };
    const url = qs.stringifyUrl(
      { url: window.location.href, query },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  };

  return (
    <div className="w-full flex flex-row gap-5 items-center justify-center">
      <Button
        variant="outline"
        disabled={isFirst}
        onClick={() => onPageChange(paginated.page - 1)}
      >
        Previous
      </Button>
      <div className="shrink-0">
        Page {+paginated.page + 1}/{paginated.pages}
      </div>
      <Button
        variant="outline"
        disabled={isLast}
        onClick={() => onPageChange(paginated.page + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationControls;
