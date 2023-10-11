import { FunctionComponent } from "react";
import { FormItem, FormLabel } from "./ui/form";

import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { url } from "decoders";
import { cn } from "@/lib/utils";

const ImageInput: FunctionComponent<{
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  className?: string;
}> = ({ value, onChange, disabled, className }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <div
          className={`
    border-4 border-dashed border-primary/10
    rounded-lg hover:opacity-75 transition
    flex flex-col space-y-2 items-center justify-center`}
        >
          <div className={cn("relative m-4 h-40 w-40", className)}>
            <Image
              fill
              alt="Image"
              src={url.value(value)?.toString() || "/placeholder.svg"}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <FormItem className="col-span-2 md:col-span-1">
          <FormLabel>Image URL</FormLabel>
          <Input
            disabled={disabled}
            placeholder="Image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </FormItem>
      </PopoverContent>
    </Popover>
  );
};

export default ImageInput;
