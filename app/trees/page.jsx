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
import { TreesIcon } from "lucide-react";
const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  const [trees, setTrees] = useState([]);
  const { user } = useUser();

  const handleGetTrees = async () => {
    const data = await getTrees(user.id);
    setTrees(data);
  };

  // Ensure useEffect runs only when `user` is available
  useEffect(() => {
    if (user) {
      handleGetTrees();
    }
  }, [user]); // ✅ Re-run when `user` changes

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1
        className={`text-[48px] font-bold ${dancingScript.className} antialiased`}
      >
        FamilyTies
      </h1>
      <main className="flex flex-col gap-8 items-center justify-center ">
        <div>Welcome back, {user?.firstname}!</div>
        <div className="flex flex-row flex-wrap gap-8">
          {trees.map((tree) => (
            <Link key={tree.tree_id} href={`/trees/${tree.tree_id}`}>
              <button className="w-40 h-40 flex flex-col justify-start p-6 bg-slate-100 rounded-lg">
                <div className="flex flex-col justify-start items-start">
                  <div className="flex justify-between w-full items-center">
                    <h1 className="font-semibold">{tree.tree_name}</h1>
                  </div>

                  <p className="text-sm text-gray-700">{tree.tree_desc}</p>
                </div>
              </button>
            </Link>
          ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
