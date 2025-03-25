"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/main/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { usePathname } from "next/navigation";

interface Props {
  userId: string;
  className?: string;
}

const FileUploader = ({ userId, className }: Props) => {
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      setUploading(true);
      setMessage("");

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
          setMessage(`${file.name} is too large. Max file size is 50MB.`);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.error) {
          setMessage("Upload failed: " + data.error);
        } else {
          setMessage("File uploaded successfully!");
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
        }
      });

      await Promise.all(uploadPromises);
      setUploading(false);
    },
    [userId, path]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer p-4 border rounded-lg shadow-md">
      <input {...getInputProps()} />
      <Button type="button" className={cn("bg-blue-900 h-[52px] gap-2 px-10 shadow-drop-1 !important", className)}>
        <Image src="/assets/icons/upload.svg" alt="upload" width={24} height={24} />
        <p>{uploading ? "Uploading..." : "Upload"}</p>
      </Button>
      {message && <p className="mt-2 text-sm text-green-500">{message}</p>}
      {files.length > 0 && (
        <ul className="fixed bottom-10 right-10 z-50 flex size-full h-fit max-w-[480px] flex-col gap-3 rounded-[20px] bg-white p-7 shadow-drop-3 !important">
          <h4 className="h4 text-light-100">Uploading</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between  gap-3 rounded-xl p-3 shadow-drop-3 !important">
                <div className="flex items-center gap-3">
                  <Thumbnail type={type} extension={extension} url={convertFileToUrl(file)} />
                  <div className="subtitle-2 mb-2 line-clamp-1 max-w-[300px] !important">
                    {file.name}
                    <Image src="/assets/icons/file-loader.gif" width={80} height={26} alt="Loader" />
                  </div>
                </div>
                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
