"use client";
import React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Phone, Clock, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
const handleEmailClick = () => {
    window.location.href = "mailto:contact@familyties.com";
    toast.success("Your mail app should now be open!");
};

return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8">

      {/* Back Button */}
    <Link href="/trees">
        <div className="absolute top-5 left-12 z-50 p-3 rounded-lg bg-white dark:bg-zinc-800 dark:text-white transition-colors duration-200 shadow-md hover:scale-105">
        <ChevronLeft size={18} />
        </div>
    </Link>

      {/* Main Card Animation */}
    <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
    >
        <Card className="shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl">
        <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
            Contact Us
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-8">
            <p className="text-lg text-center text-gray-600 dark:text-gray-300">
            We’d love to hear from you. Reach out using any of the methods below.
            </p>

            <div className="grid grid-cols-1 gap-6 text-base sm:grid-cols-2">
            <div className="flex items-start gap-4">
            <Phone className="w-6 h-6 text-muted-foreground transition-all duration-300 hover:text-primary hover:drop-shadow-md" />
                <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">Phone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">+61 3 9123 4567</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-muted-foreground transition-all duration-300 hover:text-primary hover:drop-shadow-md" />
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">contact@familyties.com</p>
                </div>
            </div>

            <div className="flex items-start gap-4 sm:col-span-2">
            <Clock className="w-6 h-6 text-muted-foreground transition-all duration-300 hover:text-primary hover:drop-shadow-md" />
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">Opening Hours</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monday–Friday: 9:00 AM – 5:00 PM<br />
                    Saturday–Sunday: Closed
                </p>
                </div>
            </div>
            </div>

            <div className="text-center">
            <motion.div whileHover={{ scale: 1.05 }}>
                <Button onClick={handleEmailClick} className="px-6 py-2 text-base rounded-full">
                Send us an Email
                </Button>
            </motion.div>
            </div>
        </CardContent>
        </Card>
    </motion.div>
    </div>
);
}
