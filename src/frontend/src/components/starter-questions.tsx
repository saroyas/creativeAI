import { ArrowUpRight } from "lucide-react";

const starterQuestions = [
  "how does the government use propaganda",
  "how do corporate lobbies work",
  "how do the rich avoid taxes",
  "why does the media manipulate the public",
];

export const StarterQuestionsList = ({
  handleSend,
}: {
  handleSend: (question: string) => void;
}) => {
  return (
    <ul className="flex flex-col space-y-1 pt-2">
      {starterQuestions.map((question) => (
        <li key={question} className="flex items-center space-x-2">
          <ArrowUpRight size={18} className="text-tint" />
          <button
            onClick={() => handleSend(question)}
            className="font-medium hover:underline decoration-tint underline-offset-4 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
          >
            {question}
          </button>
        </li>
      ))}
    </ul>
  );
};
