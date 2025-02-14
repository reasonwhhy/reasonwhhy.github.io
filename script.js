// Drag & Drop + File Input Handling
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("imageInput");

// Click to open file dialog
dropArea.addEventListener("click", () => fileInput.click());

// Handle file selection
fileInput.addEventListener("change", (event) => {
    handleFile(event.target.files[0]);
});

// Drag & Drop events
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("highlight");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("highlight");
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("highlight");
    
    const file = event.dataTransfer.files[0];
    handleFile(file);
});

// Function to handle file processing
function handleFile(file) {
    const resolutionX = parseInt(document.getElementById("resolutionXInput").value);
    const resolutionY = parseInt(document.getElementById("resolutionYInput").value);

    if (!file) {
        alert("Please upload an image file.");
        return;
    }

    if (isNaN(resolutionX) || resolutionX <= 0 || isNaN(resolutionY) || resolutionY <= 0) {
        alert("Please enter valid width and height.");
        return;
    }
    console.log("Processing image...");

    processImage(file, resolutionX, resolutionY);
}

function getClosestEmoji(r, g, b, emojiData) {
    let closestEmoji = null;
    let minDistance = Infinity;

    for (const [emoji, data] of Object.entries(emojiData)) {
        const [er, eg, eb] = data.color;
        
        // Euclidean distance formula for color comparison
        let distance = Math.sqrt((r - er) ** 2 + (g - eg) ** 2 + (b - eb) ** 2);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestEmoji = emoji;
        }
    }

    return closestEmoji;
}

document.getElementById("copyButton").addEventListener("click", () => {
    const outputText = document.getElementById("output").textContent;
    navigator.clipboard.writeText(outputText).then(() => {
        alert("Copied to clipboard!");
    }).catch(err => console.error("Failed to copy: ", err));
});

async function loadEmojiData() {
    const response = await fetch("emoji_colors.json");
    return await response.json();
}

async function processImage(imageFile, resolutionX, resolutionY) {
    console.log("Processing image...");
    const emojiData = await loadEmojiData();
    console.log("Emoji data loaded.");

    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    
    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size based on X and Y resolution input
        canvas.width = resolutionX;
        canvas.height = resolutionY;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let output = "";

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];

                const emoji = getClosestEmoji(r, g, b, emojiData);
                output += emoji;
            }
            output += "\n"; // New line for each row
        }

        document.getElementById("output").textContent = output;
    };
}

// Handle file selection
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const resolutionX = parseInt(document.getElementById("resolutionXInput").value);
    const resolutionY = parseInt(document.getElementById("resolutionYInput").value);
    if (file && resolutionX > 0 && resolutionY > 0) {
        processImage(file, resolutionX, resolutionY);
    }
});

// Drag & Drop event handling
dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("highlight");

    const file = event.dataTransfer.files[0];
    const resolutionX = parseInt(document.getElementById("resolutionXInput").value);
    const resolutionY = parseInt(document.getElementById("resolutionYInput").value);
    if (file && resolutionX > 0 && resolutionY > 0) {
        processImage(file, resolutionX, resolutionY);
    }
});
