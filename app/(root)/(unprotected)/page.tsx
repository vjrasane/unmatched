import { redirect } from "next/navigation";

const RedirectToRoot = () => {
  redirect("/contests");
};

export default RedirectToRoot;
