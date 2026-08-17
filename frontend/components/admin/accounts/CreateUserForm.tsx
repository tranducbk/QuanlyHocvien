"use client";

import React, { useState } from "react";
import { HiOutlineUserAdd, HiOutlineCollection } from "react-icons/hi";
import Tabs, { TabItem } from "@/library/Tabs";
import CreateSingleUser from "./CreateSingleUser";
import CreateBatchUsers from "./CreateBatchUsers";

const CreateUserForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState("single");

  const tabs: TabItem[] = [
    {
      id: "single",
      label: "Thêm một người",
      icon: <HiOutlineUserAdd size={18} />,
      content: (
        <CreateSingleUser/>
      ),
    },
    {
      id: "batch",
      label: "Thêm hàng loạt (Excel)",
      icon: <HiOutlineCollection size={18} />,
      content: (
        <CreateBatchUsers/>
      ),
    },
  ];

  return (
    <div className="py-2">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        fullWidth
      />
    </div>
  );
};

export default CreateUserForm;
