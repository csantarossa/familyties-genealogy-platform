"use client";
import "@xyflow/react/dist/style.css";
import FlowSpace from "./components/FlowSpace";
import AddPersonButton from "./components/AddPersonButton";
import SidePanel from "./components/SidePanel";
import { createContext, useEffect, useState } from "react";
import AddPersonModal from "./components/AddPersonModal";
import toast, { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { useUser } from "@/app/contexts/UserContext";
import { getTrees } from "@/app/actions";
import { useParams, useRouter } from "next/navigation";

export const SidePanelContext = createContext();
export const AddPersonModalContext = createContext();

function Home() {
  const [sidePanelContent, setSidePanelContent] = useState({
    trigger: false,
    firstname: "",
    middlename: "",
    lastname: "",
    other: "",
    img: "",
  });

  const router = useRouter();

  const { user } = useUser();

  useEffect(() => {
    checkUserOwnsTree();
  }, [user]);

  const { treeId } = useParams();

  const [addPersonModal, setAddPersonModal] = useState(false);

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

  return (
    <AddPersonModalContext.Provider value={[addPersonModal, setAddPersonModal]}>
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
          <FlowSpace />
        </div>
      </SidePanelContext.Provider>
    </AddPersonModalContext.Provider>
  );
}

export default Home;
