import * as React from "react";
import './index.css';

const SidebarMenuItems = [
  {
    name: "Note",
    icon: ""
  },
  {
    name: "Tag",
    icon: ""
  },
  {
    name: "TODO",
    icon: ""
  },
  {
    name: "FlowChat",
    icon: ""
  },
  {
    name: "MindMap",
    icon: ""
  },
  {
    name: "AppCenter",
    icon: ""
  }
];
function Sidebar() {
  return (
    <div className="sidebar">
      {SidebarMenuItems.map(item => (
        <div className="sidebar-item">{item.name}</div>
      ))}
    </div>
  );
}

export default function AppLayout(props: any) {
  return (
    <div className="layout">
      <Sidebar />
      {props.children}
    </div>
  );
}
