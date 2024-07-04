// src/components/messages-list.tsx
import { AssistantMessage, ChatMessage, MessageType } from "@/types";
import { AssistantMessageContent } from "./assistant-message";
import { Separator } from "./ui/separator";
import { UserMessageContent } from "./user-message";
import { ShareButton } from "./share-button";

const MessagesList = ({
  messages,
  streamingMessage,
  onRelatedQuestionSelect,
}: {
  messages: ChatMessage[];
  streamingMessage: AssistantMessage | null;
  onRelatedQuestionSelect: (question: string) => void;
}) => {
  const firstUserMessage = messages.find(m => m.role === MessageType.USER)?.content || '';
  const lastNonStreamingAssistantMessageIndex = messages
    .filter(m => m.role === MessageType.ASSISTANT)
    .findLastIndex(m => m.role === MessageType.ASSISTANT);

  return (
    <div className="flex flex-col pb-28">
      {messages.map((message, index) =>
        message.role === MessageType.USER ? (
          <UserMessageContent key={index} message={message} />
        ) : (
          <>
            <AssistantMessageContent
              key={index}
              message={message}
              onRelatedQuestionSelect={onRelatedQuestionSelect}
            />
            {index === lastNonStreamingAssistantMessageIndex && (
              <div className="flex justify-end mt-2 mb-4">
                <ShareButton code={firstUserMessage} />
              </div>
            )}
            {index !== messages.length - 1 && <Separator />}
          </>
        )
      )}
      {streamingMessage && (
        <AssistantMessageContent
          message={streamingMessage}
          isStreaming={true}
          onRelatedQuestionSelect={onRelatedQuestionSelect}
        />
      )}
    </div>
  );
};

export default MessagesList;