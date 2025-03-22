"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dancing_Script } from "next/font/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTrees } from "../actions";
import { useUser } from "../contexts/UserContext";
import {
  MergeIcon,
  PlusCircleIcon,
  PlusIcon,
  Trash,
  TreeDeciduous,
  TreesIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import NewTreeModal from "./components/NewTreeModal";
import { useRouter } from "next/navigation";
const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  const [trees, setTrees] = useState([]);
  const { user, logout } = useUser();
  const router = useRouter();

  const handleGetTrees = async () => {
    // const data = await getTrees(user.id);
    // setTrees(data);
  };

  // useEffect(() => {
  //   console.log("setting user");
  //   if (user) {
  //     handleGetTrees();
  //   }
  // }, [user]);

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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1
        className={`text-[48px] font-bold ${dancingScript.className} antialiased`}
      >
        FamilyTies
      </h1>
      <main className="flex flex-col gap-8 items-start justify-center ">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-start items-center">
            <TreeDeciduous strokeWidth={2.2} size={24} />
            <h1 className="text-2xl font-medium leadingno">Trees Dashboard</h1>
          </div>

          <div>Welcome back, {user?.firstname}!</div>
        </div>

        <div className="grid grid-cols-4 row-auto gap-8 h-96 overflow-y-scroll">
          <NewTreeModal />

          {trees.map((tree) => (
            <Link key={tree.tree_id} href={`/trees/${tree.tree_id}`}>
              <button className="w-48 h-40 flex flex-col justify-start p-6 bg-slate-100 rounded-lg">
                <div className="flex flex-col justify-start items-start overflow-hidden gap-1">
                  <div className="flex justify-between w-full items-start gap-1">
                    <h1 className="font-semibold text-start w-full leading-none">
                      {tree.tree_name}
                    </h1>
                    <Trash
                      size={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteTree(tree);
                      }}
                      className="w-fit h-fit"
                    />
                  </div>

                  <p className="text-sm text-gray-700 text-start">
                    {tree.tree_desc}
                  </p>
                </div>
              </button>
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
