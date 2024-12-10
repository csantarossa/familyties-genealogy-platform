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

export default function Home() {
  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmedPassword: "",
  });

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
          <CardContent>
            <form>
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
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Button>Create Account</Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
