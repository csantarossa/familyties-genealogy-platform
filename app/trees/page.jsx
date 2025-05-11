"use client";

import { Button } from "@/components/ui/button";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTrees } from "../actions";
import { useUser } from "../contexts/UserContext";
import { Edit, Trash } from "lucide-react";
import toast from "react-hot-toast";
import NewTreeModal from "./components/NewTreeModal";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EditTreeModal from "./components/EditTreeModal";
const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
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

  const handleTreeRename = async (tree_id) => {
    console.log("Begun");
    try {
      const response = await fetch("/api/trees", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ tree_id, editedDesc, editedTitle }),
      });
      console.log(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTree = async (tree) => {
    const deleteTreeToast = toast.loading("Deleting the tree");
    const approval = confirm(`Do you want to delete tree: ${tree.tree_name}?`);
    if (!approval) return;

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
        toast.error("Failed to delete tree");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the tree.");
    }
    toast.dismiss(deleteTreeToast);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-10 py-20 gap-4 font-[family-name:var(--font-geist-sans)]">
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
            <Link
              onClick={() => toast.loading("Opening Tree...")}
              key={tree.tree_id}
              className="h-fit w-fit"
              href={`/trees/${tree.tree_id}`}
            >
              <div className="w-48 h-40 flex flex-col justify-start p-6 bg-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer border-4 border-gray-100 duration-150 relative">
                <div className="flex flex-col justify-start items-start overflow-hidden gap-1">
                  <div className="flex justify-between w-full items-start gap-1">
                    <h1 className="font-semibold text-start w-full leading-none">
                      {tree.tree_name}
                    </h1>
                  </div>

                  <p className="text-sm text-gray-700 text-start">
                    {tree.tree_desc}
                  </p>
                </div>
                <div className="flex gap-3 absolute right-2 bottom-2">
                  {/* <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTreeRename(tree.tree_id);
                    }}
                  > */}
                  <EditTreeModal
                    editedTitle={tree.tree_name}
                    editedDesc={tree.tree_desc}
                    id={tree.tree_id}
                    setEditedTitle={setEditedTitle}
                    setEditedDesc={setEditedDesc}
                  />
                  {/* </div> */}

                  <Trash
                    size={17}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteTree(tree);
                    }}
                  />
                </div>
              </div>
            </Link>
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
