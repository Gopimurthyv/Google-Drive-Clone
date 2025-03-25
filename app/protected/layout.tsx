import React from "react";

import { redirect } from "next/navigation";
import { getCurrentUser } from "../actions";


export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {

  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return (
    <main className="flex h-screen">

        <div className="main-content">{children}</div>

    </main>
  );
};
export default Layout;