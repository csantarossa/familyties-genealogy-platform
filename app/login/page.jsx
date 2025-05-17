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
import toast from "react-hot-toast";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  const [loginUser, setLoginUser] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const { user, login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging in...");

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

    if (data.success) {
      login(data.user);
      toast.success("Welcome back!");
      router.push("/trees");
    } else {
      toast.error(data.message); // Toast error when invalid credentials
      setLoginUser({ email: "", password: "" }); // Reset form on error
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Welcome back to FamilyTies.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    required
                    placeholder="Email Address"
                    value={loginUser.email}
                    onChange={(e) =>
                      setLoginUser({ ...loginUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    required
                    placeholder="Password"
                    value={loginUser.password}
                    onChange={(e) =>
                      setLoginUser({ ...loginUser, password: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Link href="/signup">
                <Button variant="outline" type="button">
                  Create Account
                </Button>
              </Link>
              <Button type="submit">Login</Button>
            </CardFooter>
          </Card>
        </form>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
