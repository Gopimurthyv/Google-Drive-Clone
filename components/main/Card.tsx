import { FileItem } from "@/app/actions";
import React from "react";
import Link from "next/link";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";

type CardProps = {
  file: FileItem;
};

const Card: React.FC<CardProps> = ({ file }) => {
  return (
     <Link href={file.url} target="_blank" className="flex cursor-pointer flex-col gap-6 rounded-[18px] bg-white p-5 shadow-sm transition-all hover:shadow-drop-3 !important">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />

        <div className="flex flex-col items-end justify-between">
          {/* <ActionDropdown file={file} /> */}
          ActionDropDown...
          <p className="text-[16px] leading-[20px] font-normal">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-light-100 !important">
        <p className="text-[14px] leading-[20px] font-semibold line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.created_at}
          className="text-[16px] leading-[24px] font-normal text-light-100"
        />
        <p className="text-[12px] leading-[16px] font-normal line-clamp-1 text-light-200">
          By: {typeof file.owner === "string" ? "Unknown User" : file.owner.fullName}
        </p>
      </div>
    </Link>
  );
};

export default Card;
