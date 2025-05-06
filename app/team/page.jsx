"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, UserCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const teamMembers = [
{
    name: "Corey Santarossa",
    role: "Project Coordinator",
    bio: "Keeps the team aligned and ensures timelines are met with precision and clarity.",
},
{
    name: "Marco Giacoppo",
    role: "Frontend Developer",
    bio: "Focused on crafting interactive user experiences and seamless UI integrations.",
},
{
    name: "Levin Fubex",
    role: "Quality Assurance",
    bio: "Ensures reliability by rigorously testing features and squashing bugs.",
},
{
    name: "Vivek Saini",
    role: "Data & Infrastructure Engineer",
    bio: "Manages database structures, GEDCOM import logic, and data integrity.",
},
{
    name: "Nick Wijaya",
    role: "UI/UX Designer",
    bio: "Shapes the visual identity and enhances usability across the entire platform.",
},
{
    name: "Rupayan Banerjee",
    role: "Full Stack Developer",
    bio: "Builds end-to-end features, manages dark mode integration, and handles API logic.",
},
];

export default function AboutTeamPage() {
return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8">

      {/* Back Button */}
    <Link href="/trees">
        <div className="absolute top-5 left-12 z-50 p-3 rounded-lg bg-white dark:bg-zinc-800 dark:text-white transition-colors duration-200 shadow-md hover:scale-105">
        <ChevronLeft size={18} />
        </div>
    </Link>

      {/* Card Layout */}
    <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
    >
        <Card className="shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl">
        <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
            About the Team
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-10">
            <p className="text-lg text-center text-gray-600 dark:text-gray-300">
            Meet the people behind FamilyTies — passionate about genealogy, clean design, and building meaningful tools.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {teamMembers.map((member, idx) => (
                <motion.div
                key={idx}
                className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-zinc-800 p-5 shadow-md hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                <div className="flex items-center gap-4 mb-3">
                    <UserCircle2 className="w-10 h-10 text-muted-foreground transition-all duration-300 hover:text-primary hover:drop-shadow-md" />
                    <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{member.bio}</p>
                </motion.div>
            ))}
            </div>
        </CardContent>
        </Card>
    </motion.div>
    </div>
);
}
