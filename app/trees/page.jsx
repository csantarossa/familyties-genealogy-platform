"use client";

import { Button } from "@/components/ui/button";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTrees } from "../actions";
import { useUser } from "../contexts/UserContext";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import NewTreeModal from "./components/NewTreeModal";
import { useRouter } from "next/navigation";
const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  const [trees, setTrees] = useState([]);
  const router = useRouter();
  const { user, logout } = useUser();

  useEffect(() => {
    if (user) {
      handleGetTrees();
    }
  }, [user]);

  const handleGetTrees = async () => {
    const data = await getTrees(user.id);
    setTrees(data);
  };

  const handleDeleteTree = async (tree) => {
    const approval = confirm(`Do you want to delete tree: ${tree.tree_name}?`);
    if (!approval) return;

    try {
      const response = await fetch(`/api/trees/${tree.tree_id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
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
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-10 py-20 gap-4 font-[family-name:var(--font-geist-sans)]">
      <h1
        className={`text-[48px] font-bold ${dancingScript.className} antialiased`}
      >
        FamilyTies
      </h1>
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
              key={tree.tree_id}
              className="h-fit w-fit"
              href={`/trees/${tree.tree_id}`}
            >
              <div className="w-48 h-40 flex flex-col justify-start p-6 bg-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer border-4 border-gray-100 duration-150">
                <div className="flex flex-col justify-start items-start overflow-hidden gap-1">
                  <div className="flex justify-between w-full items-start gap-1">
                    <h1 className="font-semibold text-start w-full leading-none">
                      {tree.tree_name}
                    </h1>

                    {/* Allows you do delete any tree except #2 as this is my demo tree */}
                    {tree.tree_id === 2 ? (
                      <></>
                    ) : (
                      <Trash
                        size={18}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteTree(tree);
                        }}
                        className="w-fit h-fit"
                      />
                    )}
                  </div>

                  <p className="text-sm text-gray-700 text-start">
                    {tree.tree_desc}
                  </p>
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
