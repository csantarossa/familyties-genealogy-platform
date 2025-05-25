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

  const [errors, setErrors] = useState({});

  const router = useRouter();
  const toast = useSafeToast();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { firstname, lastname, email, password, confirmedPassword } = newUser;

    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstname) newErrors.firstname = "Required";
    if (!lastname) newErrors.lastname = "Required";
    if (!email) newErrors.email = "Required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid";
    if (!password) newErrors.password = "Required";
    if (!confirmedPassword) newErrors.confirmedPassword = "Required";
    if (password && confirmedPassword && password !== confirmedPassword) {
      newErrors.confirmedPassword = "Mismatch";
      setErrors(newErrors);
      toast.error("Passwords does not match!");
      return;
    }


    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Fill in all required fields!");
      return;
    }

    const toastId = toast.loading("Creating user...");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, email, password }),
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
        setErrors({});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
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
                    <Label htmlFor="firstname" className="dark:text-zinc-200">First Name*</Label>
                    <Input
                      id="firstname"
                      placeholder="First Name"
                      value={newUser.firstname}
                      onChange={(e) =>
                        setNewUser({ ...newUser, firstname: e.target.value })
                      }
                      className={`dark:bg-zinc-700 dark:text-white dark:border-zinc-600 ${errors.firstname ? "border-red-500" : ""}`}
                    />


                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="lastlastname" className="dark:text-zinc-200">Last Name*</Label>
                    <Input
                      id="lastname"
                      placeholder="Last Name"
                      value={newUser.lastname}
                      onChange={(e) =>
                        setNewUser({ ...newUser, lastname: e.target.value })
                      }
                      className={`dark:bg-zinc-700 dark:text-white dark:border-zinc-600 ${errors.lastname ? "border-red-500" : ""}`}
                    />

                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email" className="dark:text-zinc-200">Email*</Label>
                  <Input
                    id="email"
                    placeholder="Email Address"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className={`dark:bg-zinc-700 dark:text-white dark:border-zinc-600 ${errors.email ? "border-red-500" : ""}`}
                  />

                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password" className="dark:text-zinc-200">Password*</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className={`dark:bg-zinc-700 dark:text-white dark:border-zinc-600 ${errors.password ? "border-red-500" : ""}`}
                  />

                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirmPassword" className="dark:text-zinc-200">Confirm Password*</Label>
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
                    className={`dark:bg-zinc-700 dark:text-white dark:border-zinc-600 ${errors.confirmedPassword ? "border-red-500" : ""}`}
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