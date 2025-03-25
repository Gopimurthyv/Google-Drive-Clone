import FileUploader from "@/components/main/FileUploader";
import Search from "@/components/main/Search";
import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <div className="hidden items-center justify-between gap-5 p-3 sm:flex lg:py-7 xl:gap-10 w-full bg-gray-100 shadow !important">
        
        <div>
          <FetchDataSteps />
        </div>
      </div>
    </>
  );
}
