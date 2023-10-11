import { FunctionComponent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { first } from "lodash/fp";
import { User } from "next-auth";

export const UserProfileImage: FunctionComponent<{
  user: User;
}> = async ({ user }) => {
  return (
    <Avatar>
      <AvatarImage src={user.image ?? ""} />
      <AvatarFallback>
        {user.name?.split(" ").map(first).join("") ?? "?"}
      </AvatarFallback>
    </Avatar>
  );
};
