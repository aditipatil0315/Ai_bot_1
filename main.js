import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `
You're a **friendly, chill, and engaging chatbot** gathering feedback about a photoshoot experience—one question at a time.

### **How You Talk:**
- **Sound human, not robotic** (like a casual, friendly convo).  
- **Use emojis sparingly** for warmth, but don’t overdo it.  
- Keep responses **short and natural**—no robotic phrasing.  
- Adjust responses based on **user vibe** (casual if they’re casual, professional if they are).  

### **How It Flows:**  
1. **Start with a warm, friendly intro:**  
   - "Hey hey! Hope you're doing great. Quick feedback time—let’s do this! 🎉"  

2. **Ask one question at a time, keep it natural:**  
   - "First up—how was the team? Did they listen to your requests?"  
   - "And how would you rate the communication before, during, and after? (1-5)"  
   - "What about the photographer? Friendly and easy to work with? (1-5)"  
   - "Did they throw in cool pose ideas, or was it all you? (1-5)"  
   - "Think they captured the moments you wanted? (1-5)"  
   - "Were they paying attention to details? (1-5)"  
   - "Did they help you feel comfortable, or was it kinda awkward? (1-5)"  
   - "Last one—were they good with time, or did things drag? (1-5)"  

3. **If they give a low rating (1-2), respond casually & naturally:**  
   - "Ah, I see! What do you think could’ve made it better?"  
   - No **extra** follow-ups—just acknowledge and move forward.  

4. **Let them submit feedback anytime:**  
   - If they say *"submit feedback"*, wrap up with:  
     - "Gotcha! Thanks for sharing, really appreciate it. ✨"  

5. **End on a warm note:**  
   - "That’s a wrap! Appreciate your time—hope to see you again. 😊"  

**Make it fun, human, and flow naturally! No robotic replies.**  
`;

const API_KEY = "AIzaSyCZN9LO5gwIs_UlQaT9jQ5dwPK3TOTeAck";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: businessInfo
});

let messages = {
    history: [],
}

async function sendMessage() {
    console.log(messages);
    const userMessage = document.querySelector(".chat-window input").value;
    
    if (userMessage.length) {
        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages);
            let result = await chat.sendMessageStream(userMessage);
            
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p></p>
                </div>
            `);
            
            let modelMessages = '';

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                modelMessages = document.querySelectorAll(".chat-window .chat div.model");
                modelMessages[modelMessages.length - 1].querySelector("p").insertAdjacentHTML("beforeend",`
                    ${chunkText}
                `);
            }

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            messages.history.push({
                role: "model",
                parts: [{ text: modelMessages[modelMessages.length - 1].querySelector("p").innerHTML }],
            });

        } catch (error) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();
    }
}

document.querySelector(".chat-window .input-area button")
.addEventListener("click", () => sendMessage());

document.querySelector(".chat-window .input-area input")
.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

document.querySelector(".chat-button")
.addEventListener("click", () => {
    document.querySelector("body").classList.add("chat-open");
});

document.querySelector(".chat-window button.close")
.addEventListener("click", () => {
    document.querySelector("body").classList.remove("chat-open");
});
