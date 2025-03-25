
import React from "react";
import Sort from "@/components/main/Sort";
import { FileItem, getFiles } from "../../actions";
import Card from "@/components/main/Card";
import { getFileTypesParams } from "@/lib/utils";

export async function generateStaticParams() {
  return [{ type: "documents" }, { type: "images" }, { type: "videos" }];
}

type PageProps = {
  params: { type?: string };
  searchParams: { query?: string; sort?: string };
};

const Page = async ({ params, searchParams }: PageProps) => {
  if (!params || !searchParams) return <p>Loading...</p>;

  // ✅ Ensure `params` and `searchParams` are properly handled
  const type = params?.type ?? "";
  const searchText = searchParams?.query ?? "";
  const sort = searchParams?.sort ?? "created_at-desc";

  const types = getFileTypesParams(type);
  const files = await getFiles({ types, searchText, sort });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 !important">
      <section className="w-full">
        <h1 className="text-[34px] leading-[42px] font-bold capitalize">{type || "All Files" }</h1>

        <div className="flex mt-2 flex-col justify-between sm:flex-row sm:items-center !important">
          <p className="text-[16px] leading-[24px] font-normal">
            Total: <span className="text-[16px] leading-[24px] font-semibold">{files.length} files</span>
          </p>

          <div className="mt-5 flex items-center sm:mt-0 sm:gap-3 !important">
            <p className="text-[16px] leading-[24px] font-normal hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {/* Render files */}
      {files.length > 0 ? (
        <section className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 !important">
          {files.map((file) => (
            <Card key={file.id} file={file} />
          ))}
        </section>
      ) : (
        <p className="text-[16px] leading-[24px] font-normal mt-10 text-center text-light-200 !important">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;
