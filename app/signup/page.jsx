"use client";
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
import { useRouter } from "next/navigation";

import { useSafeToast } from "../lib/toast";

export default function SignupPage() {
  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmedPassword: "",
  });

  const router = useRouter();
  const toast = useSafeToast();

  const handleSignup = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating user...");

    try {
      if (newUser.password !== newUser.confirmedPassword) {
        toast.dismiss(toastId);
        return toast.error("Passwords don't match");
      }

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
      toast.dismiss(toastId);

      if (data.success) {
        toast.success("Account created! Please log in.");
        router.replace("/login");
        setNewUser({
          firstname: "",
          lastname: "",
          email: "",
          password: "",
          confirmedPassword: "",
        });
      } else {
        toast.error(data.message); // e.g., "Account already exists"
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] dark:bg-zinc-900 dark:text-white">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Card className="w-[400px] dark:bg-zinc-800 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Create Account</CardTitle>
            <CardDescription className="dark:text-zinc-300">
              Get started on your family tree today.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignup}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex gap-3">
                  <div className="flex flex-col space-y-1.5 w-[40%]">
                    <Label htmlFor="firstname" className="dark:text-zinc-200">Firstname</Label>
                    <Input
                      id="firstname"
                      placeholder="Firstname"
                      value={newUser.firstname}
                      onChange={(e) =>
                        setNewUser({ ...newUser, firstname: e.target.value })
                      }
                      className="dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="lastlastname" className="dark:text-zinc-200">Lastname</Label>
                    <Input
                      id="lastname"
                      placeholder="Lastname"
                      value={newUser.lastname}
                      onChange={(e) =>
                        setNewUser({ ...newUser, lastname: e.target.value })
                      }
                      className="dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email" className="dark:text-zinc-200">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email Address"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password" className="dark:text-zinc-200">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirmPassword" className="dark:text-zinc-200">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={newUser.confirmedPassword}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        confirmedPassword: e.target.value,
                      })
                    }
                    className="dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Link href="/login">
                <Button
                  variant="outline"
                  type="button"
                  className="dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                >
                  Login
                </Button>
              </Link>
              <Button className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500">
                Create Account
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}