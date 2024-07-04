// src/components/messages-list.tsx
"use client";
import { AssistantMessage, ChatMessage, MessageType } from "@/types";
import { AssistantMessageContent } from "./assistant-message";
import { Separator } from "./ui/separator";
import { UserMessageContent } from "./user-message";
import { ShareButton } from "./share-button";
import { useMemo } from "react";

const MessagesList = ({
  messages,
  streamingMessage,
  onRelatedQuestionSelect,
}: {
  messages: ChatMessage[];
  streamingMessage: AssistantMessage | null;
  onRelatedQuestionSelect: (question: string) => void;
}) => {
  const firstUserMessage = useMemo(() => 
    messages.find(m => m.role === MessageType.USER)?.content || '', 
    [messages]
  );

  const lastAssistantMessageIndex = useMemo(() => 
    messages.map(m => m.role).lastIndexOf(MessageType.ASSISTANT),
    [messages]
  );

  return (
    <div className="flex flex-col pb-28">
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === MessageType.USER ? (
            <UserMessageContent message={message} />
          ) : (
            <>
              <AssistantMessageContent
                message={message}
                onRelatedQuestionSelect={onRelatedQuestionSelect}
              />
              {index === lastAssistantMessageIndex && (
                <div className="flex justify-end mt-2 mb-4">
                  <ShareButton code={firstUserMessage} />
                </div>
              )}
            </>
          )}
          {index !== messages.length - 1 && <Separator />}
        </div>
      ))}
      {streamingMessage && (
        <>
          <AssistantMessageContent
            message={streamingMessage}
            isStreaming={true}
            onRelatedQuestionSelect={onRelatedQuestionSelect}
          />
          {lastAssistantMessageIndex === -1 && (
            <div className="flex justify-end mt-2 mb-4">
              <ShareButton code={firstUserMessage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessagesList;