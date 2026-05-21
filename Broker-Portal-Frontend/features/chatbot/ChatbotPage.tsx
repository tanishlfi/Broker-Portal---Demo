"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Paperclip } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
  };
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

const initialBotMessage: Message = {
  id: "1",
  sender: "bot",
  text: "Hello! I am your RMA Broker Support Bot. I can help you with questions about leads, quotes, policies, and more. What can I assist you with today?",
  timestamp: new Date(),
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size exceeds 10MB limit");
        return;
      }

      // Validate file type (allow common document and image types)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("File type not supported. Please upload PDF, Word, Excel, CSV, or image files.");
        return;
      }

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !uploadedFile) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue || (uploadedFile ? `Uploaded file: ${uploadedFile.name}` : ""),
      timestamp: new Date(),
      file: uploadedFile || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setUploadedFile(null);
    setIsLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: generateBotResponse(inputValue, uploadedFile),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string, file?: UploadedFile | null): string => {
    // Handle file uploads
    if (file) {
      const fileType = file.type;
      if (fileType.includes("pdf") || fileType.includes("word") || fileType.includes("spreadsheet") || fileType.includes("csv")) {
        return `I've received your document "${file.name}" (${(file.size / 1024).toFixed(2)} KB). I can help you with:\n• Extracting employee data from CSV files\n• Processing policy documents\n• Analyzing quote templates\n\nWhat would you like me to do with this file?`;
      } else if (fileType.includes("image")) {
        return `I've received your image "${file.name}". I can help you with:\n• Extracting text from documents\n• Analyzing charts and graphs\n• Processing ID verification images\n\nHow can I assist you with this image?`;
      }
    }

    const input = userInput.toLowerCase();

    if (input.includes("lead")) {
      return "To create a new lead, navigate to the 'Leads' section and click 'Create New Lead'. You'll need to enter the employer information, contact details, and number of employees. Would you like more details about any specific step?";
    } else if (input.includes("quote")) {
      return "I can help you with quotes! We offer both Quick Quotes and Full Quotes. Quick Quotes are faster for initial estimates, while Full Quotes provide detailed coverage options. Which type would you like to know more about?";
    } else if (input.includes("policy")) {
      return "You can view and manage policies in the 'Policies' section. From there, you can download documents, view coverage details, and manage policy information. Is there a specific policy you need help with?";
    } else if (input.includes("invoice") || input.includes("payment")) {
      return "For failed invoice payments, please check the 'Failed Invoices' section in Tools & Support. You can view details about payment failures and retry payments. Would you like guidance on resolving a specific payment issue?";
    } else if (input.includes("help") || input.includes("support")) {
      return "I'm here to help! You can ask me about:\n• Creating and managing leads\n• Generating quotes\n• Managing policies\n• Handling payments and invoices\n• Portal navigation\n• Uploading documents\n\nWhat would you like to know?";
    } else if (input.includes("hello") || input.includes("hi")) {
      return "Hello! Welcome to the RMA Broker Portal. How can I assist you today?";
    } else {
      return "That's a great question! I can help you with information about leads, quotes, policies, payments, and portal features. You can also upload documents for processing. Could you provide more details about what you need help with?";
    }
  };

  return (
    <main
      className="flex-1 p-5 min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Chatbot
        </h1>
      </div>

      {/* Chat Container */}
      <div
        className="rounded-lg overflow-hidden flex flex-col"
        style={{
          background: "var(--card-secondary)",
          border: "0.625px solid var(--border)",
          height: "calc(100vh - 200px)",
          maxHeight: "800px",
        }}
      >
        {/* Chat Header */}
        <div
          className="flex items-center gap-4 p-6"
          style={{
            background: "var(--table-header-bg)",
            borderBottom: "0.625px solid var(--border)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              background: "#00B8DB",
              width: "48px",
              height: "48px",
            }}
          >
            <MessageCircle size={24} style={{ color: "#FFFFFF" }} />
          </div>
          <div>
            <h2 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
              RMA Support Assistant
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Always online
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{
            background: "var(--background)",
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-xs lg:max-w-md">
                {message.file && (
                  <div
                    className="mb-2 px-4 py-3 rounded-lg flex items-center gap-2"
                    style={{
                      background: "rgba(31, 195, 235, 0.15)",
                      border: "1px solid rgba(31, 195, 235, 0.3)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        📎 {message.file.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {(message.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className="px-4 py-3 rounded-lg"
                  style={{
                    background:
                      message.sender === "user"
                        ? "var(--table-header-bg)"
                        : "var(--card-primary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-lg"
                style={{
                  background: "var(--table-header-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "#00B8DB" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "#00B8DB", animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "#00B8DB", animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className="p-4"
          style={{
            background: "var(--table-header-bg)",
            borderTop: "0.625px solid var(--border)",
          }}
        >
          {/* File Upload Preview */}
          {uploadedFile && (
            <div
              className="mb-3 px-3 py-2 rounded-lg flex items-center justify-between"
              style={{
                background: "rgba(31, 195, 235, 0.1)",
                border: "1px solid rgba(31, 195, 235, 0.3)",
              }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    📎 {uploadedFile.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeUploadedFile}
                className="ml-2 flex-shrink-0 transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Upload Button - Paperclip Icon */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif"
            />
            <button
              onClick={triggerFileInput}
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{
                background: "transparent",
                width: "36px",
                height: "36px",
                color: "var(--text-secondary)",
              }}
              title="Upload file"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Paperclip size={18} />
            </button>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Type your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSendMessage();
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
              style={{
                background: "var(--card-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputValue.trim() && !uploadedFile)}
              className="flex items-center justify-center rounded-lg font-medium transition-colors"
              style={{
                background: isLoading || (!inputValue.trim() && !uploadedFile) ? "#00B8DB" : "#00B8DB",
                color: "#FFFFFF",
                width: "82px",
                height: "36px",
                opacity: isLoading || (!inputValue.trim() && !uploadedFile) ? 0.6 : 1,
                cursor: isLoading || (!inputValue.trim() && !uploadedFile) ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && (inputValue.trim() || uploadedFile)) {
                  e.currentTarget.style.background = "#0099B8";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && (inputValue.trim() || uploadedFile)) {
                  e.currentTarget.style.background = "#00B8DB";
                }
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
