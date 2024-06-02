import TextareaAutosize from "react-textarea-autosize";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowUp } from "lucide-react";

const languages = [
  "Ask anything...", // English
  "Спрашивайте что угодно...", // Russian
  "Pregunta lo que sea...", // Spanish
  "Demandez n'importe quoi...", // French
  "问任何问题...", // Chinese
  "何でも聞いてください...", // Japanese
  "이것저것 물어보세요...", // Korean
  "Frage alles...", // German
  "Fai qualsiasi domanda...", // Italian
  "Faça qualquer pergunta...", // Portuguese
];

export const AskInput = ({
  sendMessage,
  isFollowingUp = false,
}: {
  sendMessage: (message: string) => void;
  isFollowingUp?: boolean;
}) => {
  const [input, setInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % languages.length);
        setFade(true);
      }, 500); // Duration of fade out
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <form
        className="w-full overflow-hidden"
        onSubmit={(e) => {
          if (input.trim().length < 2) return;
          e.preventDefault();
          sendMessage(input);
          setInput("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim().length < 2) return;
            sendMessage(input);
            setInput("");
          }
        }}
      >
        <div className="w-full flex items-center rounded-full focus:outline-none max-h-[30vh] px-2 py-1 bg-card border-2 ">
          <TextareaAutosize
            className={`w-full bg-transparent text-lg resize-none h-[40px] focus:outline-none p-2 px-5 transition-opacity duration-500 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            placeholder={
              isFollowingUp ? "Ask a follow-up..." : languages[placeholderIndex]
            }
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="rounded-full bg-tint aspect-square h-8 disabled:opacity-20 hover:bg-tint/80"
            disabled={input.trim().length < 2}
          >
            <ArrowUp size={20} />
          </Button>
        </div>
      </form>
    </>
  );
};
