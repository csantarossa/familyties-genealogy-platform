"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmedPassword: "",
  });

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      if (newUser.password === newUser.confirmedPassword) {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            email: newUser.email,
            password: newUser.password,
          }),
        });
        const data = await response.json();
        if (data.success) {
          toast("Account created! Please log in");
          router.replace("/login");
        } else {
          toast.error(data.message);
        }
      } else {
        toast.error("Passwords don't match");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Get started on your family tree today.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignup}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex gap-3">
                  <div className="flex flex-col space-y-1.5 w-[40%]">
                    <Label htmlFor="name">Firstname</Label>
                    <Input
                      id="email"
                      placeholder="Firstname"
                      value={newUser.firstname}
                      onChange={(e) =>
                        setNewUser({ ...newUser, firstname: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Lastname</Label>
                    <Input
                      id="email"
                      placeholder="Lastname"
                      value={newUser.lastname}
                      onChange={(e) =>
                        setNewUser({ ...newUser, lastname: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email Address"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Confirm Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Confirm Password"
                    value={newUser.confirmedPassword}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        confirmedPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/login">
                <Button variant="outline" type="button">
                  Login
                </Button>
              </Link>
              <Button type="submit">Create Account</Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
