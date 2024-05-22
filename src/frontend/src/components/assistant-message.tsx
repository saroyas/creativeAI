import { AssistantMessage } from "@/types";
import { MessageComponent, MessageComponentSkeleton } from "./message";
import RelatedQuestions from "./related-questions";
import { SearchResultsSkeleton, SearchResults } from "./search-results";
import { Section } from "./section";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ErrorMessage({ content }: { content: string }) {
  return (
    <Alert className="bg-red-500/5 border-red-500/15 p-5">
      <AlertCircle className="h-4 w-4 stroke-red-500 stroke-2" />
      <AlertDescription className="text-base text-foreground">
        {content.split(" ").map((word, index) => {
          const urlPattern = /(https?:\/\/[^\s]+)/g;
          if (urlPattern.test(word)) {
            return (
              <a
                key={index}
                href={word}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {word}
              </a>
            );
          }
          return word + " ";
        })}
      </AlertDescription>
    </Alert>
  );
}

export const AssistantMessageContent = ({
  message,
  isStreaming = false,
  onRelatedQuestionSelect,
}: {
  message: AssistantMessage;
  isStreaming?: boolean;
  onRelatedQuestionSelect: (question: string) => void;
}) => {
  const {
    sources,
    content,
    relatedQuestions,
    images,
    isErrorMessage = false,
  } = message;

  if (isErrorMessage) {
    return <ErrorMessage content={message.content} />;
  }

  return (
    <div className="flex flex-col">

      <Section title="Answer" animate={isStreaming} streaming={isStreaming}>
        {content ? (
          <MessageComponent message={message} isStreaming={isStreaming} />
        ) : (
          <MessageComponentSkeleton />
        )}

      </Section>
    </div>
  );
};
