import React from "react";

import { redirect } from "next/navigation";
import Sidebar from "@/components/main/Sidebar";
import { getCurrentUser } from "../actions";
import { Search } from "lucide-react";
import FileUploader from "@/components/main/FileUploader";
import { createClient } from "@/utils/supabase/server";


export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {

  const supabase = await createClient();

  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <main className="flex h-screen">

      <Sidebar {...currentUser} />

      <section className="flex h-full flex-1 flex-col">

        <div className="hidden items-center justify-between gap-5  sm:flex lg:py-7 xl:gap-10 w-full bg-gray-100 shadow !important">
        <Search />
          <div className="flex-center min-w-fit gap-4 !important">
            <FileUploader userId={user.id} />
          </div>
        </div>
        <div className="remove-scrollbar h-full flex-1 overflow-auto bg-light-400 px-5 py-7 sm:mr-7 sm:rounded-[30px] md:mb-7 md:px-9 md:py-10 !important">{children}</div>
      </section>

    </main>
  );
};
export default Layout;