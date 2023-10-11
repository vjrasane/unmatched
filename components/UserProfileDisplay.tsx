"use client";

import { CodeBlock, dracula, github } from "react-code-blocks";
import { useTheme } from "next-themes";
import { FunctionComponent } from "react";
import { User } from "next-auth";

const UseProfileDisplay: FunctionComponent<{
  user: User;
}> = ({ user }) => {
  const { resolvedTheme } = useTheme();
  return (
    <CodeBlock
      text={JSON.stringify(user, null, 2)}
      language="json"
      as={undefined}
      showLineNumbers={false}
      forwardedAs={undefined}
      theme={resolvedTheme === "dark" ? dracula : github}
    />
  );
};

export default UseProfileDisplay;
