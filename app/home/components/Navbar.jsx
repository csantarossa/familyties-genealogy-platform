"use client";

import React from "react";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

const components1 = [
  {
    title: "Getting Started",
    href: "/docs/primitives/alert-dialog",
    description: "Learn the basics of using the application to get started.",
  },
  {
    title: "User Guides",
    href: "/docs/primitives/tabs",
    description: "Access detailed user guides for mastering the platform.",
  },
  {
    title: "About Us",
    href: "/docs/primitives/scroll-area",
    description: "Learn more about our mission, team, and story.",
  },
  {
    title: "Contact Support",
    href: "/docs/primitives/tooltip",
    description: "Reach out to support for assistance with any issues.",
  },
];

const components2 = [
  {
    title: "Account",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Settings",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Log Out",
  },
];

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export function Navbar() {
  return (
    <NavigationMenu className="flex gap-2">
      <Link
        href={"/"}
        className={`${dancingScript.className} antialiased font-bold text-xl px-[16px]`}
      >
        FamilyTies
      </Link>
      <div className="h-[30px] w-[0.5px] bg-slate-300"></div>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>File</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium flex justify-center items-center">
                      My Trees
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Upload or Export a tree">
                Import or export family tree data seamlessly using GEDCOM file
                format.
              </ListItem>
              <ListItem href="/docs/installation" title="Collaborate and Share">
                Work with teams or family, or show off your tree. Coming soon...
              </ListItem>
              <ListItem href="/docs/installation" title="Export as PDF">
                Save your tree as a PDF. Coming soon...
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Documentation</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components1.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Account</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-[400px]">
              <ListItem href="/docs/installation" title="Account">
                Manage your account details, billing and preferences.
              </ListItem>
              <ListItem href="/docs/installation" title="Settings">
                Configure your app settings and customise your experience.
              </ListItem>
              <ListItem
                href="/login"
                className="bg-[#171717] hover:bg-[#2e2e2e] text-white hover:text-white flex justify-center items-center"
                title="Log Out"
              ></ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
              className || ""
            }`}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
