"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FunctionComponent } from "react";
import { User } from "next-auth";
import { UserProfileImage } from "./UserProfileImage";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { DialogClose } from "@radix-ui/react-dialog";

import UserProfileDisplay from "./UserProfileDisplay";

export const UserProfileMenu: FunctionComponent<{
  user: User;
}> = ({ user }) => {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserProfileImage user={user} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <DialogTrigger>Profile</DialogTrigger>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User profile</DialogTitle>
          <DialogDescription>
            This is your logged in user profile
          </DialogDescription>
        </DialogHeader>
        <UserProfileDisplay user={user} />
        <DialogFooter>
          <DialogClose>
            <Button type="submit">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
