"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function UserGuidesPage() {
  const [openItem, setOpenItem] = useState(null);
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      
      <div
        onClick={() => router.back()}
        className="absolute top-10 left-16 z-50 p-3 rounded-lg bg-white dark:bg-zinc-800 dark:text-white transition-colors duration-200 shadow-md hover:scale-105 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">User Guides</h1>

        <Accordion>
          <AccordionItem value="search" openItem={openItem} setOpenItem={setOpenItem}>
            <AccordionTrigger>Search Feature</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Search Bar:</strong> Open the MyTree pane in the navbar, and select <b>&quot;Search&quot;</b>. Enter the person&apos;s first and/or last name and click <b>&quot;Search&quot;</b>. The matched nodes will glow green for 5 seconds.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sidepanel" openItem={openItem} setOpenItem={setOpenItem}>
            <AccordionTrigger>Using the Sidepanel</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Update Info:</strong> Click on a person node and use the side panel to edit their info.</li>
                <li><strong>Add to Gallery:</strong> Use the <b>&quot;Gallery&quot;</b> tab to upload or view media.</li>
                <li><strong>Update Notes:</strong> Use the <b>&quot;Notes&quot;</b> tab to jot down personal notes.</li>
                <li><strong>Verification:</strong> You can mark a person as <b>&quot;Verified&quot;</b>.</li>
                <li><strong>Delete Person:</strong> Use the <b>&quot;bin&quot;</b> button and confirm deletion.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="manage" openItem={openItem} setOpenItem={setOpenItem}>
            <AccordionTrigger>Managing People</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Add People:</strong> Click <b>&quot;Add Person+&quot;</b> and complete the form.</li>
                <li><strong>General Info:</strong> Edit gender, birth/death info, and tags.</li>
                <li><strong>Update Relationships:</strong> Use the <b>&quot;Relationships&quot;</b> section in the side panel.</li>
                <li><strong>Update Career:</strong> Fill in career fields in the side panel.</li>
                <li><strong>Update Education:</strong> Fill in education fields in the side panel.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="trees" openItem={openItem} setOpenItem={setOpenItem}>
            <AccordionTrigger>Working with Trees</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Create Tree:</strong> Use the <b>&quot;New Tree&quot;</b> button on the dashboard.</li>
                <li><strong>Navigate Between Trees:</strong> Use the <b>&quot;Trees Dashboard&quot;</b> to switch trees.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gedcom" openItem={openItem} setOpenItem={setOpenItem}>
            <AccordionTrigger>Import/Export</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Import GEDCOM:</strong> Use <b>&quot;Import GEDCOM file&quot;</b> when creating a new tree.</li>
                <li><strong>Export Tree:</strong> This feature may be available or coming soon.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="navbar" openItem={openItem} setOpenItem={setOpenItem}>
            <AccordionTrigger>All About Navigation Bar</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Logo:</strong> Click to go back to the Trees Dashboard.</li>
                <li><strong>MyTree:</strong> Add/search for people or import GEDCOM files.</li>
                <li><strong>Resources:</strong> Access <b>Tutorials</b>, <b>User Guides</b>, <b>About</b>, and <b>Contact</b>.</li>
                <li><strong>Account:</strong> Access <b>Preferences</b>, <b>Settings</b>, or <b>Log Out</b>.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
