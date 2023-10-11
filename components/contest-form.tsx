"use client";

import { FunctionComponent } from "react";
import { Separator } from "./ui/separator";
import { Contest } from "@prisma/client";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { ContestInput } from "@/schema/contest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

import { Button } from "./ui/button";
import { Wand2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import ImageInput from "./image-input";

const FormHeading: FunctionComponent<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => {
  return (
    <div className="space-y-2 w-full">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Separator className="bg-primary/10" />
    </div>
  );
};

const ContestForm: FunctionComponent<{
  initialData?: Contest | null;
}> = ({ initialData }) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ContestInput>({
    resolver: zodResolver(ContestInput),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          imageSrc: initialData.imageSrc,
        }
      : {
          name: "",
          description: "",
          imageSrc: "",
        },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: ContestInput) => {
    try {
      let result;
      if (initialData) {
        result = await axios.patch(`/api/contests/${initialData.id}`, values);
      } else {
        result = await axios.post(`/api/contests`, values);
      }
      const contest: Contest = result.data;
      toast({ description: "Success!" });
      router.refresh();
      router.push(`/contests/${contest.id}`);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", description: "Something went wrong!" });
    }
  };

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pb-10"
        >
          <FormHeading
            title="Create New Contest"
            subtitle="Give some general information before adding contestants!"
          />
          <FormField
            name="imageSrc"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4">
                <FormControl>
                  <div className="space-y-4 w-full flex flex-col justify-center items-center">
                    <ImageInput
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Name" {...field} />
                  </FormControl>
                  <FormDescription>The name for your contest</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short description that will be displayed in each match
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex justify-center">
            <Button className="w-full md:w-auto" size="lg" disabled={isLoading}>
              {initialData ? "Edit" : "Create"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContestForm;
