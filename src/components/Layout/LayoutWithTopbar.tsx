import React from "react";
import { Layout, LayoutProps } from "./Layout";
import { Toolbar } from "../Toolbar";
import { Outlet } from "react-router";

export const LayoutWithToolbar: React.FC<LayoutProps> = (props) => {
  return (
    <Layout {...props}>
      <Toolbar />
      <Outlet />
    </Layout>
  );
};
