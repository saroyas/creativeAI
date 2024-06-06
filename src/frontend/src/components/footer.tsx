import React from 'react';

export function Footer({
  handleSend,
}: {
  handleSend: (message: string) => void;
}) {
  const sendAboutUs = () => {
    handleSend("About Us");
  };

  return (
    <footer className="w-full fixed bottom-0 right-0 p-1 z-50 bg-background/95 flex justify-center items-center">
      <div className="flex flex-row space-x-4">
        <button
          onClick={sendAboutUs}
          className="text-3xl md:text-xs font-medium hover-dark-grey transition-colors duration-200 ease-in-out"
        >
          Who are we?
        </button>
      </div>
    </footer>
  );
}
