"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { Search } from "@geist-ui/icons";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Input } from "@/components/ui/input";
import { AddPersonModalContext } from "../page";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export function Navbar() {
  const [addPersonModal, setAddPersonModal] = useContext(AddPersonModalContext);

  return (
    <Menubar className="border-none">
      <Link
        href={"/trees/home"}
        className={`${dancingScript.className} antialiased font-bold text-xl px-[16px]`}
      >
        FamilyTies
      </Link>
      <div className="w-[0.8px] h-full bg-black opacity-40"></div>
      <div></div>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tree</MenubarItem>
          <MenubarItem>Open Tree</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Import</MenubarSubTrigger>
            <MenubarSubContent className="pr-2">
              <MenubarItem disabled>From .GEDCOM File</MenubarItem>
              <MenubarItem disabled>From .JSON File</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Export</MenubarSubTrigger>
            <MenubarSubContent className="pr-2">
              <MenubarItem disabled>To .GEDCOM File</MenubarItem>
              <MenubarItem disabled>To .JSON File</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email</MenubarItem>
              <MenubarItem>Copy link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Save</MenubarItem>
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>MyTree</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => setAddPersonModal(true)}>
            Add a Person
          </MenubarItem>
          <MenubarSeparator />
          <MenubarMenu className="">
            <MenubarItem className="flex items-center justify-between gap-1">
              Search
              <Search size={18} className="opacity-70" />
            </MenubarItem>
          </MenubarMenu>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Customise</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Tags</MenubarItem>
              <MenubarItem>Events</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
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
          <MenubarRadioGroup value="andy">
            <MenubarRadioItem value="andy">Light Mode</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Dark Mode</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem>Preferences</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Settings</MenubarItem>
          <MenubarSeparator />
          <MenubarItem className="bg-[#4877c3] text-white font-semibold">
            Log Out
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
