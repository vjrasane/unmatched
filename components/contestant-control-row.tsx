"use client";

import { Contest, Contestant } from "@prisma/client";
import { FunctionComponent, useState } from "react";
import ContestantRow from "./contestant-row";
import { Edit, Trash2 } from "lucide-react";
import ContestantForm from "./contestant-form";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

const ContestantControlRow: FunctionComponent<{
  contest: Contest;
  contestant: Contestant;
}> = ({ contest, contestant }) => {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const onDelete = async () => {
    try {
      await axios.delete(
        `/api/contests/${contest.id}/contestants/${contestant.id}`
      );

      toast({ description: "Success!" });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", description: "Something went wrong!" });
    }
  };

  if (showForm)
    return (
      <ContestantForm
        contest={contest}
        initialData={contestant}
        onClose={() => setShowForm(false)}
      />
    );
  return (
    <ContestantRow contestant={contestant}>
      <div className="flex justify-end items-center gap-4 pr-4">
        <Edit
          className="w-6 h-6 cursor-pointer"
          onClick={() => setShowForm(true)}
        />
        <Trash2 className="w-6 h-6 cursor-pointer" onClick={onDelete} />
      </div>
    </ContestantRow>
  );
};

export default ContestantControlRow;
