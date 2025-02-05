import React from "react";
import { Layout, LayoutProps } from "./Layout";
import { Toolbar } from "../Toolbar";

export const LayoutWithToolbar: React.FC<LayoutProps> = ({
  children,
  ...props
}) => {
  return (
    <Layout {...props}>
      <Toolbar />
      {children}
    </Layout>
  );
};
