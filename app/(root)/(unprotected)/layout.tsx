import { Sidebar } from "@/components/Sidebar";
import { FunctionComponent } from "react";

const Layout: FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="h-full">{children}</div>;
};

export default Layout;
