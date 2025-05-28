"use client";
import "@xyflow/react/dist/style.css";
import FlowSpace from "./components/FlowSpace";
import AddPersonButton from "./components/AddPersonButton";
import SidePanel from "./components/SidePanel";
import { createContext, useEffect, useState } from "react";
import AddPersonModal from "./components/AddPersonModal";
import { Navbar } from "./components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { getTrees } from "@/app/actions";
import { PersonProvider } from "@/app/contexts/PersonContext";
import { useRef } from "react";

import { useSafeToast } from "../../lib/toast";

export const SidePanelContext = createContext();
export const AddPersonModalContext = createContext();

function Home() {
  const router = useRouter();
  const [sidePanelContent, setSidePanelContent] = useState({
    trigger: false,
    firstname: "",
    middlename: "",
    lastname: "",
    other: "",
    img: "",
  });
  const [version, setVersion] = useState(0); // Auto-refresh state

  const { user, loading } = useUser();

  const { treeId } = useParams();

  const [addPersonModal, setAddPersonModal] = useState(false);

  const toast = useSafeToast();
  
  const checkUserOwnsTree = async () => {
    const trees = await getTrees(user.id);
    const ownsIt = trees.some((t) => Number(t.tree_id) === Number(treeId));
    if (!ownsIt) {
      router.push("/trees");
    }
  };

  useEffect(() => {
    if (loading) return; // ⏳ Wait until localStorage check is done

    if (!user) {
      router.push("/login");
      return;
    }

    checkUserOwnsTree();
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-zinc-500">
        Loading...
      </div>
    );
  }


  return (
    <PersonProvider treeId={treeId}>
      <AddPersonModalContext.Provider
        value={[addPersonModal, setAddPersonModal]}
      >
        <SidePanelContext.Provider
          value={[sidePanelContent, setSidePanelContent]}
        >
          <div className="w-screen max-h-screen bg-white dark:bg-zinc-900">
            <div className="flex justify-center items-center p-5 gap-10 rounded-2xl shadow-md dark:shadow-zinc-700/50 w-fit absolute z-50 bg-white dark:bg-zinc-900 left-[50%] translate-x-[-50%]">
              {/* <Link href={"#"}>Logo</Link> */}
              <Navbar />
            </div>

            <AddPersonModal trigger={<AddPersonButton />} />

            <SidePanel />
            <FlowSpace refreshTrigger={version} />
          </div>
        </SidePanelContext.Provider>
      </AddPersonModalContext.Provider>
    </PersonProvider>
  );
}

export default Home;
