// Display uploaded image
function displayImage(event) {
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(imageInput.files[0]);
    }
}

// Suggestions mapping based on disease class
const suggestionsMap = {
    "Anthracnose": [
        "Apply a broad-spectrum fungicide, such as copper-based fungicides, to protect unaffected leaves and fruit.",
        "Avoid overhead watering to minimize moisture on leaves, as it encourages fungal growth.",
        "Remove and dispose of infected leaves, branches, and fruit to reduce sources of infection."
    ],
    "Bacterial Canker": [
        "Use copper-based sprays to control the spread of bacteria and protect healthy tissues.",
        "Ensure proper irrigation practices, such as avoiding excessive water near plant roots.",
        "Prune and destroy infected branches during dry weather to prevent bacterial spread."
    ],
    "Cutting Weevil": [
        "Prune and burn infected parts of the plant to eliminate breeding sites for weevils.",
        "Apply an appropriate insecticide targeted for cutting weevils, such as carbaryl or spinosad.",
        "Practice crop rotation and keep the surrounding area free from weeds to reduce pest habitats."
    ],
    "Die Back": [
        "Prune and remove all affected branches and ensure tools are sanitized to prevent further spread.",
        "Apply copper-based fungicides or carbendazim to prevent reinfection.",
        "Ensure the soil is well-drained and avoid overwatering to reduce stress on the plant."
    ],
    "Gall Midge": [
        "Practice proper field sanitation by removing and destroying galls and infected parts.",
        "Use biological pest control methods, such as introducing natural enemies like parasitic wasps.",
        "Apply systemic insecticides, such as imidacloprid, during the early stages of infestation."
    ],
    "Healthy": [
        "Your plant is healthy! Continue with regular care and enjoy its growth."
    ],
    "Powdery Mildew": [
        "Apply sulfur-based fungicides or potassium bicarbonate sprays to control fungal growth.",
        "Ensure good air circulation around plants by pruning overcrowded branches.",
        "Avoid watering plants from above to keep leaves dry, as moisture encourages mildew."
    ],
    "Sooty Mould": [
        "Control pests such as aphids, mealybugs, or scales that produce honeydew, which supports mould growth.",
        "Wash affected leaves with a mild soap solution or plain water to remove the sooty layer.",
        "Apply neem oil or insecticidal soap to prevent further infestation by honeydew-producing pests."
    ]
};

async function predictDisease() {
    const fileInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    const suggestionDiv = document.getElementById('suggestion');

    if (!fileInput.files[0]) {
        resultDiv.textContent = "Please select a mango leaf image.";
        suggestionDiv.innerHTML = ""; // Clear previous suggestions
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    resultDiv.textContent = "Predicting...";
    suggestionDiv.innerHTML = ""; // Clear previous suggestions

    try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (response.ok) {
            const diseaseClass = data.predicted_class;
            const confidence = (data.confidence * 100).toFixed(2);
            const suggestions = suggestionsMap[diseaseClass] || ["No suggestions available for this disease class."];

            // Display prediction result
            resultDiv.innerHTML = `
                <p><strong>Predicted Class:</strong> ${diseaseClass}</p>
                <p><strong>Confidence:</strong> ${confidence}%</p>
            `;

            // Render suggestions as a bulleted list
            const suggestionsList = suggestions.map(item => `<li>${item}</li>`).join("");
            suggestionDiv.innerHTML = `
                <h2>Recommended Treatment</h2>
                <ul>${suggestionsList}</ul>
            `;
        } else {
            resultDiv.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
        suggestionDiv.innerHTML = ""; // Clear previous suggestions
    }
}
