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

// Suggestions mapping
const suggestionsMap = {
    "Anthracnose": [
        "Apply a copper-based fungicide to protect leaves and fruit.",
        "Avoid overhead watering to minimize leaf moisture.",
        "Remove and destroy infected leaves and fruit."
    ],
    "Bacterial Canker": [
        "Use copper sprays to control bacteria.",
        "Avoid excessive water around roots.",
        "Prune infected branches during dry weather."
    ],
    "Cutting Weevil": [
        "Prune and burn infected parts.",
        "Apply insecticide such as spinosad.",
        "Practice crop rotation and remove weeds."
    ],
    "Die Back": [
        "Prune affected branches with sanitized tools.",
        "Apply carbendazim or copper fungicide.",
        "Ensure proper soil drainage."
    ],
    "Gall Midge": [
        "Remove and destroy galls.",
        "Introduce natural predators like wasps.",
        "Use systemic insecticides in early stage."
    ],
    "Healthy": ["Your plant is healthy! Keep up regular care."],
    "Powdery Mildew": [
        "Apply sulfur-based fungicides.",
        "Prune for better airflow.",
        "Avoid overhead watering."
    ],
    "Sooty Mould": [
        "Control honeydew-producing pests.",
        "Wash leaves with mild soap solution.",
        "Apply neem oil or insecticidal soap."
    ]
};

// Auto-detect backend URL
const backendURL = window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1")
    ? "http://127.0.0.1:5000"
    : "https://mangomedix.onrender.com";

async function predictDisease() {
    const fileInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    const suggestionDiv = document.getElementById('suggestion');

    if (!fileInput.files[0]) {
        resultDiv.textContent = "Please select a mango leaf image.";
        suggestionDiv.innerHTML = "";
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    resultDiv.textContent = "Predicting...";
    suggestionDiv.innerHTML = "";

    try {
        const response = await fetch(`${backendURL}/predict`, {
            method: 'POST',
            body: formData
        });

        // Check content type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            resultDiv.textContent = "Server error: Response not in JSON format.";
            return;
        }

        const data = await response.json();

        if (response.ok) {
            const diseaseClass = data.predicted_class;
            const confidence = (data.confidence * 100).toFixed(2);
            const suggestions = suggestionsMap[diseaseClass] || ["No suggestions available."];

            resultDiv.innerHTML = `
                <p><strong>Predicted Class:</strong> ${diseaseClass}</p>
                <p><strong>Confidence:</strong> ${confidence}%</p>
            `;

            const suggestionsList = suggestions.map(item => `<li>${item}</li>`).join("");
            suggestionDiv.innerHTML = `
                <h2>Recommended Treatment</h2>
                <ul>${suggestionsList}</ul>
            `;
        } else {
            resultDiv.textContent = `Error: ${data.error || "Unknown error"}`;
        }
    } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
        suggestionDiv.innerHTML = "";
    }
}
