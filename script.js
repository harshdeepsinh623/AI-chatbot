let prompt = document.querySelector("#prompt");
let submit = document.querySelector("#submit");
let chatcontainer = document.querySelector(".chat-container");
let imageButton = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAaJUiDArHJ5SBcgiPQcp7iZkTT6Q3hzyc";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null,
    },
};

async function generateResponse(aiChatbox) {
    let text = aiChatbox.querySelector(".AI-chat-area");

    let requestPayload = {
        contents: [
            {
                parts: [
                    { text: user.message },
                    ...(user.file.data
                        ? [{ inline_data: { mime_type: user.file.mime_type, data: user.file.data } }]
                        : []),
                ],
            },
        ],
    };

    let RequestOption = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
    };

    try {
        let response = await fetch(Api_url, RequestOption);
        let data = await response.json();

        let apiResponse =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, "$1")?.trim() ||
            "AI failed to generate a response.";
        text.innerHTML = apiResponse;
    } catch (error) {
        console.error("API error:", error);
        text.innerHTML = "An error occurred while processing the response.";
    } finally {
        chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("Choose");
        user.file = { mime_type: null, data: null };
    }
}

function createChatbox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;

    if (!user.message.trim()) {
        alert("Message cannot be empty.");
        return;
    }

    let html = ` <img src="img/user.png" alt="" id="userImage" width="8%">
                <div class="user-chat-area">
                  ${user.message}
                  ${
                      user.file.data
                          ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />`
                          : ""
                  }
                </div>`;

    prompt.value = "";

    let userChatbox = createChatbox(html, "user-chat-box");
    chatcontainer.appendChild(userChatbox);
    chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `<img src="img/AI.png" alt="" id="aiImage" width="10%">
                <div class="AI-chat-area">
                <img src="img/loading-dots.gif" alt="" class="load" width="50px">
                </div>`;

        let aiChatbox = createChatbox(html, "ai-chat-box");
        chatcontainer.appendChild(aiChatbox);

        generateResponse(aiChatbox);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handlechatResponse(prompt.value);
    }
});

submit.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string,
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("Choose");
    };

    reader.readAsDataURL(file);
});

imageButton.addEventListener("click", () => {
    imageButton.querySelector("input").click();
});
