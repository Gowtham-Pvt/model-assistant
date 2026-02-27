// --- DOM ELEMENTS ---
const micBtn = document.getElementById('mic-btn');
const logContainer = document.getElementById('conversation-log');

// --- SPEECH RECOGNITION & SYNTHESIS SETUP ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const synth = window.speechSynthesis;

recognition.continuous = false; // Stop listening after one command
recognition.lang = 'en-US';

// --- MAIN EVENT LISTENER ---
micBtn.addEventListener('click', () => {
    recognition.start();
});

recognition.onstart = () => {
    micBtn.classList.add('listening');
};

recognition.onend = () => {
    micBtn.classList.remove('listening');
};

recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    logMessage('user', command);
    handleCommand(command);
};

// --- UTILITY FUNCTIONS ---
function talk(text) {
    logMessage('assistant', text);
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: Choose a different voice
    // const voices = synth.getVoices();
    // utterance.voice = voices[1];
    synth.speak(utterance);
}

function logMessage(sender, message) {
    const entry = document.createElement('div');
    entry.classList.add('log-entry', sender === 'user' ? 'log-user' : 'log-assistant');
    entry.textContent = `${sender === 'user' ? 'You' : 'Assistant'}: ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight; // Auto-scroll
}


// --- COMMAND HANDLER ---
async function handleCommand(command) {
    console.log("Command:", command);

    if (command.includes("play")) {
        const song = command.replace("play", "").trim();
        talk("Playing " + song + " on YouTube");
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`, '_blank');

    } else if (command.includes("time")) {
        const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        talk("The current time is " + time);

    } else if (command.includes("who is")) {
        const person = command.replace("who is", "").trim();
        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(person)}`);
            const data = await response.json();
            if (data.type === 'disambiguation') {
                talk(`I found multiple results for ${person}. Please be more specific.`);
            } else {
                talk(data.extract);
            }
        } catch (error) {
            talk("Sorry, I couldn't find information on that.");
        }

    } else if (command.includes("joke")) {
        try {
            const response = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
            const data = await response.json();
            talk(data.joke);
        } catch (error) {
            talk("Sorry, I couldn't think of a joke right now.");
        }

    } else if (command.includes("weather")) {
        // ⚠️ WARNING: Exposing API keys client-side is insecure.
        const apiKey = "681a1f09381f186fed6a7a6151c691ec"; // Your OpenWeatherMap key
        talk("Which city?");
        // In a real app, you'd listen for the next command for the city.
        // For simplicity, let's assume a default or parse it from the command.
        const city = "Visakhapatnam"; // Default city
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.main) {
                const weather = `The temperature in ${city} is ${data.main.temp}°C with ${data.weather[0].description}.`;
                talk(weather);
            } else {
                 talk("Sorry, I couldn't fetch the weather for that city.");
            }
        } catch (error) {
            talk("Sorry, I couldn't fetch the weather right now.");
        }


    } else if (command.includes("news")) {
         // ⚠️ WARNING: Exposing API keys client-side is insecure.
        const apiKey = "502001af2ddf43e2a6443e8f99f64474"; // Your NewsAPI key
        try {
            const url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.articles && data.articles.length > 0) {
                 const headlines = data.articles.slice(0, 3).map(article => article.title).join(". ");
                 talk("Here are the top headlines: " + headlines);
            } else {
                talk("Sorry, I couldn't fetch the news.");
            }
        } catch(error) {
            talk("Sorry, I couldn't fetch the news right now.");
        }


    } else if (command.includes("open google")) {
        talk("Opening Google");
        window.open("https://google.com", '_blank');
        
    } else if (command.includes("open youtube")) {
        talk("Opening YouTube");
        window.open("https://youtube.com", '_blank');
    
    } else if (command.includes("date")) {
        talk("Sorry, I am a web assistant, I can't go on dates.");
        
    } else if (command.includes("are you single")) {
        talk("I am in a relationship with your web browser.");
        
    } else {
        // --- Fallback to a general purpose API (like OpenAI) ---
        // ⚠️ EXTREMELY DANGEROUS to put your OpenAI key here.
        // This should ALWAYS be done on a server. This is for demonstration ONLY.
        const openAIApiKey = "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";
        if (openAIApiKey === "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") {
             talk("I'm not sure how to respond to that. The OpenAI feature is not configured.");
             return;
        }
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIApiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: command }]
                })
            });
            const data = await response.json();
            talk(data.choices[0].message.content);
        } catch (error) {
            talk("Sorry, I couldn't reach my advanced brain right now.");
        }
    }
}