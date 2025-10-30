"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-start w-full">
          <Button
            className="visible dark:hidden w-full flex justify-start"
            variant={"ghost"}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] " /> <span>Light</span>
          </Button>
          <Button
            variant={"ghost"}
            className="transition-all dark:visible  dark:text-white hidden w-full dark:flex justify-start"
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" /> <span>Dark</span>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
