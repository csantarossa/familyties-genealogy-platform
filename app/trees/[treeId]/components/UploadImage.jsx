import { Camera } from "@geist-ui/icons";
import React from "react";

const UploadImage = () => {
  return (
    <div className="w-28 h-28 flex justify-center items-center bg-[#f5f5f5] rounded-lg cursor-pointer hover:bg-[#efefef] duration-150">
      <Camera className="w-8 h-8 stroke-[1.6px] stroke-slate-500" />
    </div>
  );
};

export default UploadImage;
