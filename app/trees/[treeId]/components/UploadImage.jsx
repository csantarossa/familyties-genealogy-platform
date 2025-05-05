import { Camera } from "@geist-ui/icons";
import React from "react";

const UploadImage = () => {
  return (
    <div className="w-28 h-28 flex justify-center items-center bg-[#f5f5f5] dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-[#efefef] dark:hover:bg-gray-600 duration-150">
      <Camera className="w-8 h-8 stroke-[1.6px] stroke-slate-500 dark:stroke-slate-300" />
    </div>
  );
};

export default UploadImage;