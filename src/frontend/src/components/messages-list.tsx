"use client";
import { AssistantMessage, ChatMessage, MessageType } from "@/types";
import { AssistantMessageContent } from "./assistant-message";
import { Separator } from "./ui/separator";
import { UserMessageContent } from "./user-message";
import AppStoreButtons from "./app-store-buttons";import { useMemo } from "react";

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

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as 'column', // Type assertion to ensure TypeScript knows the exact type
      paddingBottom: '7rem', // pb-28
    },
    shareButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end' as 'flex-end', // Type assertion to ensure TypeScript knows the exact type
      marginTop: '0.5rem', // mt-2
      marginBottom: '1rem', // mb-4
    },
  };

  return (
    <div style={styles.container}>
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
              <div style={styles.shareButtonContainer}>
                <AppStoreButtons/>
              </div>
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
          {/* {lastAssistantMessageIndex === -1 && (
            <div style={styles.shareButtonContainer}>
              <ShareButton code={firstUserMessage} />
            </div>
          )} */}
        </>
      )}
    </div>
  );
};

export default MessagesList;
