import React from "react";
import "./highlightjs.css";

export const PreTag: React.FC<React.PropsWithChildren> = (props) => {
  return <pre {...props} />;
};
