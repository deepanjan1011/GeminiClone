const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const sendMessageButton = document.querySelector("#send-message-button");

let userMessage = null;
let isResponseGenerating = false;
let API_URL = null;
let isApiKeyLoaded = false;

// Disable the input form and send button initially until the API key is loaded
sendMessageButton.disabled = true;
typingForm.querySelector("input").disabled = true;

fetch('/api/key')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data || !data.apiKey) {
      throw new Error("API key missing in response");
    }
    const apiKey = data.apiKey;
    API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    console.log('API Key fetched and API_URL updated:', API_URL);
    isApiKeyLoaded = true;
    sendMessageButton.disabled = false;
    typingForm.querySelector("input").disabled = false;
  })
  .catch(error => {
    console.error('Error fetching API key:', error); 
    alert("There was an issue fetching the API key. Please try again later.");
  });

// Function to handle outgoing chat (sending the message)
const handleOutgoingChat = () => {
  userMessage = document.querySelector(".typing-input").value.trim();
  if (!userMessage) return;

  // Clear the input field after submitting
  document.querySelector(".typing-input").value = "";

  // Add user message to chat container
  const userMessageDiv = createMessageElement(userMessage, "user-message");
  chatContainer.appendChild(userMessageDiv);

  // Add bot loading message
  const incomingMessageDiv = createMessageElement("...", "bot-message", "loading");
  chatContainer.appendChild(incomingMessageDiv);

  isResponseGenerating = true;
  generateAPIResponse(incomingMessageDiv);

  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Function to create a message element
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);

  // Add a div inside with class 'text' for the text content
  const textDiv = document.createElement("div");
  textDiv.classList.add("text");
  textDiv.innerHTML = content;

  div.appendChild(textDiv);
  return div;
};

// Function to show typing effect
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(" ");
  let currentWordIndex = 0;
  const typingInterval = setInterval(() => {
    textElement.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75);
};

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  if (!API_URL) {
    textElement.innerText = "Error: API key not loaded. Please try again later.";
    textElement.parentElement.closest(".message").classList.add("error");
    incomingMessageDiv.classList.remove("loading");
    isResponseGenerating = false;
    return;
  }
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data?.candidates?.length) {
      throw new Error("No response from API.");
    }

    const apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message || "An error occurred.";
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

// Event listener for theme toggle
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
});

// Event listener for deleting chat history
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete the chat history? This action cannot be undone.")) {
    chatContainer.innerHTML = "";
    localStorage.removeItem("saved-chats");
  }
});

// Load saved chats on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedChats = localStorage.getItem("saved-chats");
  if (savedChats) {
    chatContainer.innerHTML = savedChats;
  }
});

// Event listener for message sending
sendMessageButton.addEventListener("click", handleOutgoingChat);
typingForm.addEventListener("submit", (e) => e.preventDefault());

// Handle suggestion click
suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", (e) => {
    const messageText = suggestion.querySelector(".text").innerText;
    document.querySelector(".typing-input").value = messageText;
    handleOutgoingChat();
  });
});
