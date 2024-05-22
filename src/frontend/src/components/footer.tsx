import Link from "next/link";
import { Button } from "./ui/button";
import { SiX, SiGithub, SiDiscord } from "react-icons/si";

export function Footer() {
  return (
    <footer className="w-full flex fixed bottom-0 right-0 p-1 z-50 bg-background/95">
      <div className="px-1 w-full flex flex-row justify-between space-x-1 items-center">
        <div className="text-sm">
          <span>Compute sponsored by </span>
          <Link href="https://siliconsoul.xyz" target="_blank" className="font-bold">
            Silicon Soul AI
          </Link>
        </div>
        <div className="flex flex-row space-x-1">
          <Button variant="ghost" size="icon" className="hover:bg-transparent">
            <Link href="https://discord.gg/kKmmqmjx" target="_blank">
              <SiDiscord size={16} />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-transparent">
            <Link href="https://git.new/farfalle" target="_blank">
              <SiGithub size={16} />
            </Link>
          </Button>
          <Link href="https://x.com/rashadphz" target="_blank">
            <Button variant="ghost" size="icon" className="hover:bg-transparent">
              <SiX size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
