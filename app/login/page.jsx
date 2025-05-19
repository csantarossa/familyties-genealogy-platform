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
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { useSafeToast } from "../lib/toast";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  const [loginUser, setLoginUser] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const { user, login, notificationsEnabled } = useUser();
  const toast = useSafeToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging in...");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginUser.email,
          password: loginUser.password,
        }),
      });

      const data = await response.json();

      toast.dismiss(toastId);

      if (!response.ok || !data.success) {
        toast.error(data.message || "Login failed. Please try again.");
        setLoginUser({ email: "", password: "" });
        return;
      }

      login(data.user);
      toast.success("Welcome back!");
      router.push("/trees");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Something went wrong. Please try again.");
      console.error("Login error:", error);
    }
  };


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] dark:bg-zinc-900 dark:text-white dark:bg-zinc-900 dark:text-white">
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

      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start shadow-md">
        <form onSubmit={handleLogin}>
          <Card className="w-[350px] dark:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Login</CardTitle>
              <CardDescription className="dark:text-zinc-300">
                Welcome back to FamilyTies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name" className="dark:text-zinc-200">Email</Label>
                  <Input
                    id="email"
                    required
                    placeholder="Email Address"
                    value={loginUser.email}
                    onChange={(e) =>
                      setLoginUser({ ...loginUser, email: e.target.value })
                    }
                    className="dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password" className="dark:text-zinc-200">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    required
                    placeholder="Password"
                    value={loginUser.password}
                    onChange={(e) =>
                      setLoginUser({ ...loginUser, password: e.target.value })
                    }
                    className="dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Link href="/signup">
                <Button variant="outline" type="button" className="dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600">
                  Create Account
                </Button>
              </Link>
              <Button type="submit" className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500">Login</Button>
            </CardFooter>
          </Card>
        </form>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}