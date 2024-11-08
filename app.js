// Get references to HTML elements
const uploadImage = document.getElementById('uploadImage');
const originalCanvas = document.getElementById('originalCanvas');
const maskedCanvas = document.getElementById('maskedCanvas');
const outputCanvas = document.getElementById('outputCanvas');
const colorPicker = document.getElementById('colorPicker');
const applyColor = document.getElementById('applyColor');
const originalCtx = originalCanvas.getContext('2d');
const maskedCtx = maskedCanvas.getContext('2d');
const outputCtx = outputCanvas.getContext('2d');

// API Key for Remove.bg
const REMOVE_BG_API_KEY = 'ZfRW86muogeHqPFuogQpvirE';

// Load and display the uploaded image on the original canvas
uploadImage.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            outputCanvas.width = img.width;
            outputCanvas.height = img.height;
            originalCtx.drawImage(img, 0, 0);
            URL.revokeObjectURL(img.src);
        };
    }
});

// Function to isolate the foreground and apply background color
applyColor.addEventListener('click', async () => {
    const file = uploadImage.files[0];
    if (!file) return alert('Please upload an image first.');

    // Fetch selected color
    const selectedColor = colorPicker.value;
    const red = parseInt(selectedColor.slice(1, 3), 16);
    const green = parseInt(selectedColor.slice(3, 5), 16);
    const blue = parseInt(selectedColor.slice(5, 7), 16);

    // Prepare form data for Remove.bg API request
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    // Send request to Remove.bg to isolate the background
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
            // Draw masked image on the hidden masked canvas
            maskedCanvas.width = img.width;
            maskedCanvas.height = img.height;
            maskedCtx.drawImage(img, 0, 0);
            URL.revokeObjectURL(img.src);

            // Apply color to the background
            applyBackgroundColor(red, green, blue);
        };
    } else {
        console.error('Error processing image with Remove.bg:', response.statusText);
    }
});

// Function to apply background color using the mask
function applyBackgroundColor(red, green, blue) {
    // Draw the original image on the output canvas
    outputCtx.drawImage(originalCanvas, 0, 0);

    // Get image data for both original and mask
    const originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const maskedImageData = maskedCtx.getImageData(0, 0, maskedCanvas.width, maskedCanvas.height);
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);

    // Loop through each pixel
    for (let i = 0; i < originalImageData.data.length; i += 4) {
        // If the mask pixel is transparent (alpha channel = 0), it's background
        if (maskedImageData.data[i + 3] === 0) {
            // Set the background pixel to the selected color
            outputImageData.data[i] = red;       // Red
            outputImageData.data[i + 1] = green; // Green
            outputImageData.data[i + 2] = blue;  // Blue
        } else {
            // Preserve the original pixel where the object exists
            outputImageData.data[i] = originalImageData.data[i];
            outputImageData.data[i + 1] = originalImageData.data[i + 1];
            outputImageData.data[i + 2] = originalImageData.data[i + 2];
            outputImageData.data[i + 3] = originalImageData.data[i + 3];
        }
    }

    // Update the output canvas with the final image data
    outputCtx.putImageData(outputImageData, 0, 0);
}
