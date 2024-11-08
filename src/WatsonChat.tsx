// src/components/WatsonChat.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const WatsonChat = () => {
  useEffect(() => {
    // Define Watson chat options
    (window as any).watsonAssistantChatOptions = {
      integrationID: "5b11787d-dafc-4e3b-ae01-9cd75c6bae10",
      region: "us-south",
      serviceInstanceID: "e06e3735-bcd4-4600-8be4-77e6ad84af58",
      onLoad: async (instance: any) => {
        await instance.render();
      }
    };

    // Create and append the script tag
    const script = document.createElement('script');
    script.src = "https://web-chat.global.assistant.watson.appdomain.cloud/versions/" +
                 ((window as any).watsonAssistantChatOptions.clientVersion || 'latest') +
                 "/WatsonAssistantChatEntry.js";
    script.async = true;
    document.head.appendChild(script);

    // Cleanup script on component unmount
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null; // This component does not render any visible content
};

export default WatsonChat;
