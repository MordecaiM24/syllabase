"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  GalleryVerticalEnd,
  Home,
  Bookmark,
  CheckCircle,
} from "lucide-react";
import { SchoolSwitcher } from "./SchoolSwitcher";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Bookmarks",
    url: "/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Saved",
    url: "/saved",
    icon: CheckCircle,
  },
];

const schools = [
  {
    name: "NCSU",
    logo: GalleryVerticalEnd,
    plan: "",
  },
  {
    name: "UNC",
    logo: AudioWaveform,
    plan: "Coming soon!",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SchoolSwitcher schools={schools} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
