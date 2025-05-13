"use client";

import { Button } from "@/components/ui/button";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTrees } from "../actions";
import { useUser } from "../contexts/UserContext";
import { Edit, Trash } from "lucide-react";
import NewTreeModal from "./components/NewTreeModal";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EditTreeModal from "./components/EditTreeModal";
const dancingScript = Dancing_Script({ subsets: ["latin"] });

import { useSafeToast } from "../lib/toast";

export default function Home() {
  const toast = useSafeToast();
  const [trees, setTrees] = useState([]);
  const router = useRouter();
  const { user, logout } = useUser();
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");

  useEffect(() => {
    if (user) {
      handleGetTrees();
    }
  }, [user]);

  const handleGetTrees = async () => {
    toast.loading("Fetching trees");
    const data = await getTrees(user.id);
    setTrees(data);
    toast.dismiss();
  };

  const handleDeleteTree = async (tree) => {
    const approval = confirm(`Do you want to delete tree: ${tree.tree_name}?`);
    if (!approval) return;

    const deleteTreeToast = toast.loading("Deleting the tree");

    try {
      const response = await fetch(`/api/trees/${tree.tree_id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.dismiss(deleteTreeToast);
        toast.success("Tree deleted successfully");
        setTrees((prevTrees) =>
          prevTrees.filter((t) => t.tree_id !== tree.tree_id)
        );
      } else {
        toast.dismiss(deleteTreeToast);
        toast.error("Failed to delete tree");
      }
    } catch (error) {
      toast.dismiss(deleteTreeToast);
      toast.error("An error occurred while deleting the tree.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-10 py-20 gap-4 font-[family-name:var(--font-geist-sans)] bg-white dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
      <div className="flex justify-center items-center gap-2">
        <div className="h-10 w-10 relative">
          <Image objectFit="fit" layout="fill" alt="logo" src="/logo.png" />
        </div>
        <h1
          className={`text-[48px] font-bold ${dancingScript.className} antialiased`}
        >
          FamilyTies
        </h1>
      </div>

      <main className="flex flex-col gap-8 items-start justify-center ">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-start items-center">
            <h1 className="text-2xl font-medium leadingno">Trees Dashboard</h1>
          </div>

          <div>Welcome back, {user?.firstname}!</div>
        </div>

        <div className="grid grid-cols-4 row-auto gap-8 h-96 overflow-y-scroll">
          <NewTreeModal onTreeCreated={handleGetTrees} />

          {trees.map((tree) => (
            <div
              key={tree.tree_id}
              className="w-48 h-40 flex flex-col justify-start p-6 
              bg-gray-100 dark:bg-zinc-800 
              hover:bg-gray-50 dark:hover:bg-zinc-700 
              rounded-lg border-4 dark:border-zinc-700
              border-gray-100 
              duration-150 relative cursor-pointer transition-colors"
              onClick={() => {
                toast.loading("Loading Tree...");
                router.push(`/trees/${tree.tree_id}`);
              }}
            >
              <div className="flex flex-col justify-start items-start overflow-hidden gap-1">
                <h1 className="font-semibold text-start w-full leading-none">
                  {tree.tree_name}
                </h1>
                <p className="text-sm text-gray-700 dark:text-gray-300 text-start">
                  {tree.tree_desc}
                </p>
              </div>

              <div
                className="flex gap-3 absolute right-2 bottom-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <EditTreeModal
                  editedTitle={tree.tree_name}
                  editedDesc={tree.tree_desc}
                  id={tree.tree_id}
                  onUpdate={handleGetTrees}
                />
                <Trash
                  className="cursor-pointer"
                  size={17}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteTree(tree);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Button
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Log Out
        </Button>
      </footer>
    </div>
  );
}
