"use client";
import "@xyflow/react/dist/style.css";
import FlowSpace from "./components/FlowSpace";
import AddPersonButton from "./components/AddPersonButton";
import SidePanel from "./components/SidePanel";
import { createContext, useEffect, useState } from "react";
import AddPersonModal from "./components/AddPersonModal";
import toast, { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { getTrees } from "@/app/actions";
import { PersonProvider } from "@/app/contexts/PersonContext";
import { useRef } from "react";

export const SidePanelContext = createContext();
export const AddPersonModalContext = createContext();
export const FileInputContext = createContext();

function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [sidePanelContent, setSidePanelContent] = useState({
    trigger: false,
    firstname: "",
    middlename: "",
    lastname: "",
    other: "",
    img: "",
  });
  const [version, setVersion] = useState(0); // ✅ Auto-refresh state

  const { user } = useUser();

  const { treeId } = useParams();

  const [addPersonModal, setAddPersonModal] = useState(false);

  useEffect(() => {
    checkUserOwnsTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkUserOwnsTree = async () => {
    if (!user) return;

    const trees = await getTrees(user.id);

    const filteredTrees = trees.filter(
      (tree) => Number(tree.tree_id) === Number(treeId)
    );
    if (filteredTrees.length > 0) {
      return;
    } else {
      router.push("/trees");
    }
  };

  const handleGedcomUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    const res = await fetch(`/api/trees/${treeId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gedcomContent: text }),
    });

    const json = await res.json();
    toast.success(json.message || "Import successful!");
    setVersion((v) => v + 1); // ✅ Triggers tree refresh
  };

  return (
    <FileInputContext.Provider value={fileInputRef}>
      <PersonProvider treeId={treeId}>
        <AddPersonModalContext.Provider
          value={[addPersonModal, setAddPersonModal]}
        >
          <SidePanelContext.Provider
            value={[sidePanelContent, setSidePanelContent]}
          >
            <div className="w-screen max-h-screen">
              <div className="flex justify-center items-center p-5 gap-10 rounded-2xl shadow-md w-fit absolute z-50 bg-white left-[50%] translate-x-[-50%]">
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
      <input
        type="file"
        accept=".ged"
        ref={fileInputRef}
        className="hidden" // hide the real file input
        onChange={handleGedcomUpload}
      />
    </FileInputContext.Provider>
  );
}

export default Home;
