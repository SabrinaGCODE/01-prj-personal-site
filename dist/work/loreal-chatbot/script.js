/* —— DOM elements —— */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const userQuestion = document.getElementById("userQuestion");

/* —— Cloudflare Worker URL —— */
// Replace this with your real Worker URL after you deploy it
const WORKER_URL = "https://ancient-dawn-9db9.sabrina-garcia3.workers.dev";

/* —— Conversation history (Level Up 1) —— */
const conversationHistory = [
  {
    role: "system",
    content: `You are a knowledgeable and friendly L'Oréal beauty advisor.
You help customers discover and understand L'Oréal's full range of products
including makeup, skincare, haircare, and fragrances.
You provide personalized routines and recommendations based on the user's needs.
You remember what the user has told you earlier in the conversation to give
consistent, helpful advice.
If someone asks about something unrelated to L'Oréal products, beauty, skincare,
haircare, makeup, or fragrance, politely let them know you can only assist
with L'Oréal beauty topics and invite them to ask a beauty-related question.`,
  },
];

/* —— Helper: add a bubble to the chat window —— */
function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.classList.add("msg", role);
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

/* —— Welcome message —— */
addMessage(
  "ai",
  "👋 Bonjour! I'm your L'Oréal Beauty Advisor. Ask me about skincare routines, makeup recommendations, haircare tips, or any L'Oréal product!",
);

/* —— Handle form submit —— */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Level Up 2: show user question above chat
  userQuestion.textContent = `You asked: "${message}"`;
  userQuestion.classList.remove("hidden");

  // Display user bubble
  addMessage("user", message);
  userInput.value = "";

  // Level Up 1: push user message into history
  conversationHistory.push({ role: "user", content: message });

  // Show a thinking indicator
  const thinkingBubble = addMessage(
    "ai",
    "✨ Finding the best recommendation for you…",
  );
  thinkingBubble.classList.add("thinking");

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    // Level Up 1: push assistant reply into history
    conversationHistory.push({ role: "assistant", content: aiReply });

    // Replace thinking bubble with real response
    thinkingBubble.textContent = aiReply;
    thinkingBubble.classList.remove("thinking");
  } catch (error) {
    thinkingBubble.textContent =
      "Sorry, something went wrong. Please try again!";
    thinkingBubble.classList.remove("thinking");
    console.error("API error:", error);
  }
});
