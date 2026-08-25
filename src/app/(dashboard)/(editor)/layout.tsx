"use client";

import { ReactFlowProvider } from "@xyflow/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return <ReactFlowProvider>{children}</ReactFlowProvider>;
};

export default Layout;
