// Get references to HTML elements
const uploadImage = document.getElementById('uploadImage');
const roomCanvas = document.getElementById('roomCanvas');
const colorPicker = document.getElementById('colorPicker');
const applyColor = document.getElementById('applyColor');
const ctx = roomCanvas.getContext('2d');

// Variables to handle masking
let isDrawing = false;
let maskPath = new Path2D(); // This will define the masked region

// Load the uploaded image into the canvas
uploadImage.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            roomCanvas.width = img.width;
            roomCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(img.src);
        };
    }
});

// Listen for mouse events to create the mask
roomCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    maskPath = new Path2D(); // Start a new mask path
    const rect = roomCanvas.getBoundingClientRect();
    maskPath.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

roomCanvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const rect = roomCanvas.getBoundingClientRect();
        maskPath.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // Visual guide for the user
        ctx.lineWidth = 2;
        ctx.stroke(maskPath);
    }
});

roomCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// Apply the selected color only to the masked area
applyColor.addEventListener('click', () => {
    const selectedColor = colorPicker.value;

    // Get the current image data
    const imageData = ctx.getImageData(0, 0, roomCanvas.width, roomCanvas.height);
    const data = imageData.data;

    // Convert the selected color to RGB
    const red = parseInt(selectedColor.slice(1, 3), 16);
    const green = parseInt(selectedColor.slice(3, 5), 16);
    const blue = parseInt(selectedColor.slice(5, 7), 16);

    // Loop through each pixel
    for (let y = 0; y < roomCanvas.height; y++) {
        for (let x = 0; x < roomCanvas.width; x++) {
            const index = (y * roomCanvas.width + x) * 4;

            // Check if the pixel is inside the mask
            if (ctx.isPointInPath(maskPath, x, y)) {
                // Apply the selected color only within the mask area
                data[index] = red;     // Red
                data[index + 1] = green; // Green
                data[index + 2] = blue;  // Blue
            }
        }
    }

    // Update the canvas with the new colorized image data
    ctx.putImageData(imageData, 0, 0);
});
