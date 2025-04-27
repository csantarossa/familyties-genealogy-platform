"use client";

import React, { useContext, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Dancing_Script } from "next/font/google";
import { toast } from "react-hot-toast";
import { Search } from "@geist-ui/icons";
import Image from "next/image";
import { ChevronLeft, CircleAlert, Import, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { AddPersonModalContext } from "../page";
import { useUser, logout } from "@/app/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export function Navbar() {
  const [addPersonModal, setAddPersonModal] = useContext(AddPersonModalContext);
  const { user, logout } = useUser();
  const router = useRouter();
  const { treeId } = useParams(); // ✅ Needed for uploading
  const [showFileInput, setShowFileInput] = useState(false);
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [gedcomFile, setGedcomFile] = useState(null);

  const handleGedcomUpload = async (e) => {
    setLoading(true);
    setShowFileInput(false);
    if (!gedcomFile) return;

    try {
      const text = await gedcomFile.text();
      const res = await fetch(`/api/trees/${treeId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gedcomContent: text }),
      });
      const json = await res.json();
      toast.success(json.message || "Import successful!");
      // You can refresh tree or page here if you want
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload GEDCOM file.");
    } finally {
      setLoading(false);
      setShowFileInput(false); // Remove input again after upload
      window.location.reload();
    }
  };

  return (
    <>
      <Menubar className="border-none">
        <Link
          href={"/trees"}
          className={`${dancingScript.className} antialiased font-bold text-xl px-[16px]`}
        >
          <div className="flex justify-center items-center gap-2">
            <div className="h-5 w-5 relative">
              <Image objectFit="fit" layout="fill" alt="logo" src="/logo.png" />
            </div>
            FamilyTies
          </div>
        </Link>
        <div className="w-[0.8px] h-full bg-black opacity-40"></div>

        <MenubarMenu>
          <MenubarTrigger>MyTree</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setAddPersonModal(true)}>
              Add a Person
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="flex items-center gap-1">
              <Search size={18} strokeWidth={2} className="opacity-70" />
              Search
            </MenubarItem>
            <MenubarSeparator />
            <AlertDialog open={openModal}>
              <AlertDialogTrigger
                className="flex items-center justify-center gap-1 px-2 py-1 text-sm leading-none"
                onClick={() => setOpenModal(true)}
              >
                <Import size={18} className="opacity-70 mt-[1px]" />
                Import GEDCOM File
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[430px] h-fit">
                <AlertDialogHeader className="flex h-full flex-col justify-between items-start">
                  <AlertDialogTitle className="flex justify-between items-center w-full">
                    Upload a GEDCOM file! 🎉
                  </AlertDialogTitle>
                  <div className="flex gap-2">
                    <CircleAlert className="stroke-red-600" />
                    <AlertDialogDescription className="text-red-700 flex gap-2 font-medium">
                      WARNING: Proceeding will replace your current entries with
                      the contents of the GEDCOM file.
                    </AlertDialogDescription>
                  </div>
                </AlertDialogHeader>
                <Input
                  type="file"
                  accept=".ged"
                  ref={fileInputRef}
                  onChange={(e) => setGedcomFile(e.target.files[0])}
                />
                <div className="flex w-full gap-5">
                  <Button
                    variant="secondary"
                    onClick={() => setOpenModal(false)}
                  >
                    <ChevronLeft /> Go Back
                  </Button>
                  <AlertDialogAction
                    className="flex w-full"
                    onClick={() => {
                      handleGedcomUpload();
                    }}
                  >
                    {loading ? (
                      <div className="loader"></div>
                    ) : (
                      <>
                        Upload GEDCOM File
                        <UserPlus className="" size={24} />
                      </>
                    )}
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Resources</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Tutorials</MenubarItem>
            <MenubarItem>User Guides</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>About the Team</MenubarItem>
            <MenubarItem>Contact Us</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Account</MenubarTrigger>
          <MenubarContent>
            <Link href="/preferences" passHref>
              <MenubarItem asChild>
                <span>Preferences</span>
              </MenubarItem>
            </Link>
            <Link href="/settings" passHref>
              <MenubarItem asChild>
                <span>Settings</span>
              </MenubarItem>
            </Link>
            <MenubarItem
              className="bg-[#4877c3] text-white font-semibold cursor-pointer"
              onClick={() => {
                logout(); // Clears user from localStorage and context
                router.push("/login"); // Redirects to login page
              }}
            >
              Log Out
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  );
}
