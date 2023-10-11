import { Contest, Contestant } from "@prisma/client";
import { Check, X } from "lucide-react";
import { FunctionComponent } from "react";
import ImageInput from "./image-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContestantInput } from "@/schema/contest";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

const ContestantForm: FunctionComponent<{
  initialData?: Contestant | null;
  contest: Contest;
  onClose: () => void;
}> = ({ initialData, contest, onClose }) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ContestantInput>({
    resolver: zodResolver(ContestantInput),
    defaultValues: initialData
      ? {
          name: initialData.name,
          imageSrc: initialData.imageSrc,
        }
      : {
          name: "",
          imageSrc: "",
        },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: ContestantInput) => {
    try {
      if (initialData) {
        await axios.patch(
          `/api/contests/${contest.id}/contestants/${initialData.id}`,
          values
        );
      } else {
        await axios.post(`/api/contests/${contest.id}/contestants`, values);
      }
      toast({ description: "Success!" });
      onClose();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", description: "Something went wrong!" });
    }
  };

  return (
    <div
      className="
      flex
      justify-between
      items-center
      gap-4
      px-2
      py-2
    w-full
    border-[1px] rounded-md border-primary/25
    border-dotted
    pr-4
    "
    >
      <div className="w-full flex justify-between items-center ">
        <div className="flex justify-start items-center gap-8">
          <Form {...form}>
            <FormField
              name="imageSrc"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center space-y-4">
                  <FormControl>
                    <ImageInput
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                      className="m-2 w-24 h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Name" {...field} />
                  </FormControl>
                  <FormDescription>Name of the contestant</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </div>
        <div className="flex gap-4">
          <Button onClick={form.handleSubmit(onSubmit)} variant="default">
            <Check className="cursor-pointer w-8 h-8" />
            Save
          </Button>
          <Button type="button" onClick={onClose} variant="outline">
            <X className="cursor-pointer w-8 h-8" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContestantForm;
