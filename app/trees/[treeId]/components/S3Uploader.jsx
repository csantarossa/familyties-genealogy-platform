"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

const S3Uploader = ({ onUploadComplete, setImage }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { treeId } = useParams();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const uploadFile = async (selectedFile) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`/api/trees/${treeId}/s3-upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      onUploadComplete(data.url);
    } catch (error) {
      console.error("S3 Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  );
};

export default S3Uploader;
