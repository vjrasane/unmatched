import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { FunctionComponent } from "react";
import { UserProfileMenu } from "../../components/UserProfileMenu";
import { SignInButton } from "../../components/SignInButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ModeToggle } from "../../components/ModeToggle";
import config from "@/app.config";

export const Navbar: FunctionComponent = async () => {
  const session = await getServerSession(authOptions);

  const user = session?.user;

  return (
    <div
      id="navbar"
      className="fixed top-0 w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary"
    >
      <div className="flex items-center">
        {/* <Menu className="block md:hidden" /> */}
        <Link href="/">
          <h1
            className="text-xl md:text-3xl font-bold text-primary
          font-super-comic text-orange-400"
          >
            {config.appName.toUpperCase()}
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <ModeToggle />
        {user ? <UserProfileMenu user={user} /> : <SignInButton />}
      </div>
    </div>
  );
};
