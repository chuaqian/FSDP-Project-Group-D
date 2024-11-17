// src/components/WatsonChat.tsx
import { useEffect, useRef } from 'react';

const WatsonChat = () => {
  const isLoaded = useRef(false); // Track if the widget has already been loaded

  useEffect(() => {
    if (!isLoaded.current) { // Only initialize if not already loaded
      (window as any).watsonAssistantChatOptions = {
        integrationID: "5b11787d-dafc-4e3b-ae01-9cd75c6bae10",
        region: "us-south",
        serviceInstanceID: "e06e3735-bcd4-4600-8be4-77e6ad84af58",
        onLoad: async (instance: any) => {
          try {
            await instance.render();
          } catch (error) {
            console.error("Error loading Watson Assistant instance:", error);
          }
        }
      };

      // Create and append the script tag
      const script = document.createElement('script');
      script.src = "https://web-chat.global.assistant.watson.appdomain.cloud/versions/" +
                   ((window as any).watsonAssistantChatOptions.clientVersion || 'latest') +
                   "/WatsonAssistantChatEntry.js";
      script.async = true;
      document.head.appendChild(script);

      isLoaded.current = true; // Mark as loaded
    }
  }, []);

  return null; // No visible content
};

export default WatsonChat;
