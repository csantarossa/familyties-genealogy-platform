"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const SearchModal = ({open, setOpen}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        if (open) {
          setFirstName("");
          setLastName("");
        }
      }, [open]);

    const handleSearch = () => {
        // Prevent empty input
        if (firstName.trim() === "" && lastName.trim() === "") {
            toast.error("Please enter at least a first or last name.");
            return;
        }

        const nodes = document.querySelectorAll(`[id^="node-"]`);
        let matchFound = false;

        nodes.forEach((node) => {
            const nameEls = node.querySelectorAll("[data-fullname]");
            const nameTexts = Array.from(nameEls).map((el) =>
                el.textContent.toLowerCase()
              );
              
              const [firstNameText = "", lastNameText = ""] = nameTexts;

              //True match when there is no input on either field
              const firstMatch = firstName.trim() == "" || firstNameText.includes(firstName.toLowerCase());
              const lastMatch = lastName.trim() == "" || lastNameText.includes(lastName.toLowerCase());
              
              if (firstMatch && lastMatch){
                matchFound = true;
                node.scrollIntoView({behavior: "smooth", block: "center"}); //Render screen into the node(s) found
                node.classList.add("ring-4", "ring-green-400");

                //Remove the highlight after 5 seconds
                setTimeout(() =>{
                    node.classList.remove("ring-4", "ring-green-400");
                }, 5000);
            }
        });

        //Toast error when no person found
        if (!matchFound){
            toast.error("Person not found!");
        }

        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
            <Dialog.Content className="fixed top-[50%] left-[50%] z-50 bg-white p-6 rounded-md shadow-lg -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md">
                <Dialog.Title className="text-lg font-semibold mb-4">Search for a Person</Dialog.Title>
                <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}
                className="flex flex-col gap-4"
                >
                <Input
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                    </Button>
                    <Button type="submit">Search</Button>
                </div>
                </form>
                <Dialog.Close asChild>
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <Cross2Icon />
                </button>
                </Dialog.Close>
            </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default SearchModal;