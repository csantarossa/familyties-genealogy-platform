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
import { useState } from "react";
import { redirect } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { WavyBackground } from "@/components/ui/wavy-background";
import db from "../utils/postgres";
const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  // const test = async (req, res) => {
  //   try {
  //     const connection = await db.connect();
  //     const result = await connection.query("SELECT * FROM person");
  //     res.status(200).json(result.rows);
  //   } catch (err) {
  //     console.error("Database query error:", err);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // };

  const [loginUser, setLoginUser] = useState({
    email: "",
    password: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    // Create API route to login user

    // If successful, login user and redirect to home or trees
    redirect("/home");
  };

  return (
    <WavyBackground backgroundFill="#f4f4f4" className="">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1
          className={`text-[48px] font-bold ${dancingScript.className} antialiased`}
        >
          FamilyTies
        </h1>
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
                    <Label htmlFor="name">Email</Label>
                    <Input
                      id="email"
                      placeholder="Email Address"
                      value={loginUser.email}
                      onChange={(e) =>
                        setLoginUser({ ...loginUser, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="framework">Password</Label>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginUser.password}
                      onChange={(e) =>
                        setLoginUser({ ...loginUser, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <br />
                <CardDescription>
                  <a href="#" className="underline">
                    Forgot Password?
                  </a>
                </CardDescription>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Link href="/signup">
                  <Button variant="outline" type="button">
                    Create Account
                  </Button>
                </Link>
                <Button>Login</Button>
              </CardFooter>
            </Card>
          </form>
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
      </div>
    </WavyBackground>
  );
}
