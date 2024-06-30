"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "next-themes";

  const { theme } = useTheme();
  return (
    <header className="w-full flex fixed p-1 z-50 px-2 bg-background justify-between items-center">
      <div>
        <Link href="/" passHref onClick={() => location.reload()}>
          <img
            src={theme === "light" ? "/logo.png" : "/logo.png"}
            alt="Logo"
            className="w-12 h-12 rounded-lg transform transition-transform duration-200 hover:scale-110"
          />
        </Link>
      </div>
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
