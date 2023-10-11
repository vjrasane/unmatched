"use client";

import { Contest } from "@prisma/client";
import { PlusCircleIcon } from "lucide-react";
import { FunctionComponent, useState } from "react";
import ContestantForm from "./contestant-form";

const AddContestant: FunctionComponent<{
  contest: Contest;
}> = ({ contest }) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm)
    return (
      <ContestantForm contest={contest} onClose={() => setShowForm(false)} />
    );
  return (
    <div
      onClick={() => setShowForm(true)}
      className="
      flex
      justify-start
      items-center
      gap-4
      px-6
    h-16 w-full border-2 rounded-md border-primary opacity-75 border-dashed
    hover:bg-secondary/50
    cursor-pointer
    "
    >
      <PlusCircleIcon />
      <div>Add contestant</div>
    </div>
  );
};

export default AddContestant;
