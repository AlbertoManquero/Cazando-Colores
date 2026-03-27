const video = document.getElementById('video');
const snapBtn = document.getElementById('snap');
const statusLabel = document.getElementById('detected-label');
const colorDisplay = document.getElementById('target-color-name');
const downloadBtn = document.getElementById('download');
const grid = document.getElementById('grid');

//Colores y rango
const colorDefinitions = [
    { id: 'white', name: "Blanco", hex: "#FFFFFF", h: [0, 360], s: [0, 30], l: [5, 360] },
    { id: 'red', name: "Rojo", hex: "#FF0000", h: [0, 15], s: [35, 110], l: [20, 150] },
    { id: 'orange', name: "Naranja", hex: "#FFA500", h: [15, 42], s: [40, 110], l: [25, 160] },
    { id: 'yellow', name: "Amarillo", hex: "#FFFF00", h: [42, 70], s: [30, 110], l: [30, 170] },
    { id: 'green', name: "Verde", hex: "#00FF00", h: [90, 160], s: [25, 110], l: [15, 180] },
    { id: 'blue', name: "Azul", hex: "#0000FF", h: [195, 255], s: [25, 110], l: [10, 190] },
    { id: 'lila', name: "Lila", hex: "#C8A2C8", h: [260, 285], s: [5, 70], l: [40, 200] },
    { id: 'magenta', name: "Magenta", hex: "#FF00FF", h: [285, 330], s: [30, 110], l: [20, 210] },
    { id: 'pink', name: "Rosa", hex: "#FFC0CB", h: [330, 355], s: [10, 90], l: [50, 220] }
];

const isRedOverflow = (h) => (h >= 355 && h <= 360);

//Orden
const huntOrder = ['white', 'red', 'yellow', 'pink', 'magenta', 'lila', 'green', 'orange', 'blue'];

let currentIndex = 0;
let capturedImages = [];


async function init() {

    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.className = 'slot';
        div.id = `slot-${i}`;
        grid.appendChild(div);
    }


    updateTargetDisplay();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        });
        video.srcObject = stream;
        video.onplay = () => detectLoop();
    } catch (err) {
        statusLabel.innerText = "Error: Acceso a cámara denegado";
    }
}

function detectLoop() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const size = 10;
        const x = (canvas.width / 2) - (size / 2);
        const y = (canvas.height / 2) - (size / 2);
        const pixelData = ctx.getImageData(x, y, size, size).data;

        let r = 0, g = 0, b = 0;
        for (let i = 0; i < pixelData.length; i += 4) {
            r += pixelData[i]; g += pixelData[i+1]; b += pixelData[i+2];
        }
        r /= (size*size); g /= (size*size); b /= (size*size);

    
        const [h, s, l] = rgbToHsl(r, g, b);
        const liveColorHex = hslToHex(h, s, l);
        
        let detectedColorDef = null;

        if (isRedOverflow(h)) {
            detectedColorDef = colorDefinitions.find(d => d.id === 'red');
        } else {
            detectedColorDef = colorDefinitions.find(def => 
                (h >= def.h[0] && h <= def.h[1]) &&
                (s >= def.s[0] && s <= def.s[1]) &&
                (l >= def.l[0] && l <= def.l[1])
            );
        }

        const targetId = huntOrder[currentIndex];
        const targetDef = colorDefinitions.find(d => d.id === targetId);

        document.documentElement.style.setProperty('--current-color', targetDef.hex);

        if (detectedColorDef && detectedColorDef.id === targetDef.id) {
  
            statusLabel.innerText = `¡${targetDef.name} detectado! Captura`;
            statusLabel.style.color = targetDef.hex; 
            statusLabel.style.textShadow = `0 0 10px ${targetDef.hex}`;
            snapBtn.disabled = false;
        } else {
   
            if (detectedColorDef) {
           
                statusLabel.innerText = `${detectedColorDef.name}...`;
                statusLabel.style.color = liveColorHex;
            } else {
             
                statusLabel.innerText = "Buscando color...";
                statusLabel.style.color = liveColorHex;
            }
            statusLabel.style.textShadow = "none";
            snapBtn.disabled = true;
        }
    }
    requestAnimationFrame(detectLoop);
}


snapBtn.onclick = () => {

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = video.videoWidth;
    finalCanvas.height = video.videoHeight;
    finalCanvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = finalCanvas.toDataURL('image/jpeg');

 
    const slot = document.getElementById(`slot-${currentIndex}`);
    slot.style.backgroundImage = `url(${dataUrl})`;
    slot.classList.add('filled');
    capturedImages.push(dataUrl);

    const targetId = huntOrder[currentIndex];
    const targetDef = colorDefinitions.find(d => d.id === targetId);
    confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.7 },
        colors: [targetDef.hex] 
    });

    currentIndex++;

    if (currentIndex < 9) {
        updateTargetDisplay();
    } else {
        finishGame();
    }
};

downloadBtn.onclick = () => {
   
    const collage = document.createElement('canvas');
    collage.width = 1200;
    collage.height = 1200;
    const ctx = collage.getContext('2d');

    let loadedCount = 0;
    capturedImages.forEach((src, i) => {
        const img = new Image();
        img.onload = () => {
            const x = (i % 3) * 400;
            const y = Math.floor(i / 3) * 400;
            ctx.drawImage(img, x, y, 400, 400);
            loadedCount++;

            if (loadedCount === 9) {
                const link = document.createElement('a');
                link.download = 'mi-caceria-de-colores.jpg';
                link.href = collage.toDataURL();
                link.click();
            }
        };
        img.src = src;
    });
};


function updateTargetDisplay() {
    const targetId = huntOrder[currentIndex];
    const targetDef = colorDefinitions.find(d => d.id === targetId);
    colorDisplay.innerText = targetDef.name;
   
    document.documentElement.style.setProperty('--current-color', targetDef.hex);
}

function finishGame() {
    statusLabel.innerText = "¡Cacería Completada!";
    statusLabel.style.color = "#00ff88";
    statusLabel.style.textShadow = "0 0 15px #00ff88";
    colorDisplay.innerText = "¡Felicidades!";
    snapBtn.classList.add('hidden');
    downloadBtn.classList.remove('hidden');
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

init();