"use strict";

// ========================================
// 1. ELEMENTOS DA INTERFACE
// ========================================

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const toggleCameraButton = document.getElementById("toggleCamera");
const cameraButtonText = document.getElementById("cameraButtonText");
const cameraButtonIcon = document.getElementById("cameraButtonIcon");
const captureButton = document.getElementById("captureButton");

const cameraStatus = document.getElementById("cameraStatus");
const cameraMessage = document.getElementById("cameraMessage");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");

const identificationInput = document.getElementById("identification");
const effectSelect = document.getElementById("effectSelect");

const emptyResult = document.getElementById("emptyResult");
const resultContainer = document.getElementById("resultContainer");
const resultImage = document.getElementById("resultImage");

const resultName = document.getElementById("resultName");
const resultDate = document.getElementById("resultDate");
const resultEffect = document.getElementById("resultEffect");
const downloadButton = document.getElementById("downloadButton");

// ========================================
// 2. VARIÁVEIS DA APLICAÇÃO
// ========================================

let cameraStream = null;
let isStartingCamera = false;

const effectNames = {
    normal: "Original",
    grayscale: "Preto e branco",
    sepia: "Sépia vintage",
    contrast: "Alto contraste",
    brightness: "Brilho aumentado"
};

// ========================================
// 3. MENSAGENS DA INTERFACE
// ========================================

function showMessage(message, type = "") {
    cameraMessage.textContent = message;
    cameraMessage.className = "message";

    if (type) {
        cameraMessage.classList.add(type);
    }
}

function updateCameraInterface(isActive) {
    cameraStatus.classList.toggle("online", isActive);
    cameraStatus.classList.toggle("offline", !isActive);

    cameraStatus.innerHTML = isActive
        ? '<span class="status-dot"></span> Ligada'
        : '<span class="status-dot"></span> Desligada';

    cameraButtonText.textContent = isActive
        ? "Desligar câmera"
        : "Ligar câmera";

    cameraButtonIcon.textContent = isActive ? "■" : "▶";

    video.classList.toggle("active", isActive);
    cameraPlaceholder.classList.toggle("hidden", isActive);

    captureButton.disabled = !isActive;
}

// ========================================
// 4. LIGAR A CÂMERA
// ========================================

async function startCamera() {
    if (cameraStream || isStartingCamera) {
        return;
    }

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        showMessage(
            "Seu navegador não permite acessar a câmera neste endereço. " +
            "Abra o projeto usando localhost ou HTTPS.",
            "error"
        );
        return;
    }

    isStartingCamera = true;
    toggleCameraButton.disabled = true;

    showMessage("Solicitando permissão para acessar a câmera...");

    try {
        // Solicita acesso à câmera do dispositivo.
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // Se a câmera tiver sido solicitada, mas o estado da aplicação
        // tiver mudado, encerra o stream que não será utilizado.
        if (!isStartingCamera) {
            stream.getTracks().forEach(track => track.stop());
            return;
        }

        cameraStream = stream;
        video.srcObject = cameraStream;

        await video.play();

        updateCameraInterface(true);

        showMessage(
            "Câmera ligada! Escolha seu efeito e capture a fotografia.",
            "success"
        );

        // Se o dispositivo encerrar a câmera externamente,
        // atualiza a interface e libera o recurso.
        cameraStream.getVideoTracks()[0]?.addEventListener(
            "ended",
            handleCameraEnded,
            { once: true }
        );

    } catch (error) {
        if (cameraStream) {
            stopCamera(false);
        } else {
            video.srcObject = null;
            updateCameraInterface(false);
        }

        if (error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError") {
            showMessage(
                "Permissão negada. Autorize o uso da câmera nas " +
                "configurações do navegador e tente novamente.",
                "error"
            );
        } else if (
            error.name === "NotFoundError" ||
            error.name === "DevicesNotFoundError"
        ) {
            showMessage(
                "Nenhuma câmera foi encontrada neste dispositivo.",
                "error"
            );
        } else if (error.name === "NotReadableError") {
            showMessage(
                "A câmera não está disponível. Ela pode estar sendo " +
                "utilizada por outro aplicativo.",
                "error"
            );
        } else {
            showMessage(
                "Não foi possível iniciar a câmera. Verifique as " +
                "permissões e tente novamente.",
                "error"
            );
        }

        console.error("Erro ao acessar a câmera:", error);

    } finally {
        isStartingCamera = false;
        toggleCameraButton.disabled = false;
    }
}

// ========================================
// 5. DESLIGAR A CÂMERA
// ========================================

function stopCamera(showConfirmation = true) {
    // Invalida uma solicitação de câmera que ainda está aguardando.
    isStartingCamera = false;

    if (cameraStream) {
        // Interrompe TODAS as faixas do stream.
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }

    // Desvincula o vídeo do stream.
    video.pause();
    video.srcObject = null;

    updateCameraInterface(false);

    if (showConfirmation) {
        showMessage(
            "Câmera desligada. O acesso ao dispositivo foi encerrado."
        );
    }
}

function handleCameraEnded() {
    if (cameraStream) {
        stopCamera(false);
        showMessage(
            "A câmera foi desconectada. Ligue-a novamente para continuar.",
            "error"
        );
    }
}

// ========================================
// 6. BOTÃO DE LIGAR E DESLIGAR
// ========================================

toggleCameraButton.addEventListener("click", () => {
    if (cameraStream) {
        stopCamera();
    } else {
        startCamera();
    }
});

// ========================================
// 7. CAPTURAR E PROCESSAR A FOTOGRAFIA
// ========================================

function capturePhoto() {
    // Impede a captura quando a câmera não está disponível.
    if (
        !cameraStream ||
        !cameraStream.active ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {
        showMessage(
            "Ligue a câmera e aguarde a imagem aparecer antes de capturar.",
            "error"
        );
        return;
    }

    // Registra a data e a hora reais da captura.
    const captureDate = new Date();

    // Usa as dimensões originais do vídeo para manter a qualidade.
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const width = canvas.width;
    const height = canvas.height;

    const selectedEffect = effectSelect.value;

    // Define o efeito que será aplicado pelo Canvas.
    const filters = {
        normal: "none",
        grayscale: "grayscale(100%)",
        sepia: "sepia(100%)",
        contrast: "contrast(160%)",
        brightness: "brightness(125%)"
    };

    context.save();

    context.filter = filters[selectedEffect] || "none";

    // Desenha a imagem real da câmera no Canvas.
    context.drawImage(video, 0, 0, width, height);

    // Restaura o filtro antes de desenhar a identificação.
    context.restore();

    // Adiciona uma faixa escura na parte inferior para melhorar
    // a leitura das informações sobre a fotografia.
    const footerHeight = Math.max(95, height * 0.19);

    const gradient = context.createLinearGradient(
        0,
        height - footerHeight,
        0,
        height
    );

    gradient.addColorStop(0, "rgba(5, 16, 32, 0.65)");
    gradient.addColorStop(1, "rgba(5, 16, 32, 0.94)");

    context.fillStyle = gradient;
    context.fillRect(
        0,
        height - footerHeight,
        width,
        footerHeight
    );

    // Lê a identificação digitada pelo usuário.
    const identification =
        identificationInput.value.trim() || "Captura sem identificação";

    const dateText = captureDate.toLocaleDateString("pt-BR");
    const timeText = captureDate.toLocaleTimeString("pt-BR");

    const margin = Math.max(22, width * 0.035);

    // Ajusta os tamanhos de texto à resolução da fotografia.
    const titleSize = Math.max(18, width * 0.027);
    const detailSize = Math.max(13, width * 0.017);

    // Identificação principal.
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillStyle = "#ffffff";
    context.font = `700 ${titleSize}px Arial, sans-serif`;

    // Limita o tamanho visual do nome para evitar que ultrapasse a foto.
    let displayName = identification;
    const maxTextWidth = width - margin * 2;

    while (
        displayName.length > 3 &&
        context.measureText(displayName).width > maxTextWidth
    ) {
        displayName = displayName.slice(0, -4) + "...";
    }

    context.fillText(
        displayName,
        margin,
        height - footerHeight * 0.58
    );

    // Data, hora e nome da aplicação gravados na imagem.
    context.font = `500 ${detailSize}px Arial, sans-serif`;
    context.fillStyle = "#dce8f8";

    context.fillText(
        `${dateText}  •  ${timeText}`,
        margin,
        height - footerHeight * 0.28
    );

    context.textAlign = "right";
    context.fillStyle = "#8ebaff";
    context.font = `700 ${detailSize}px Arial, sans-serif`;

    context.fillText(
        "CAPTUREID",
        width - margin,
        height - footerHeight * 0.28
    );

    context.restore();

    // Converte o Canvas em uma imagem PNG.
    const imageData = canvas.toDataURL("image/png");

    // Apresenta o resultado processado na interface.
    resultImage.src = imageData;
    resultName.textContent = identification;
    resultDate.textContent = `${dateText} às ${timeText}`;
    resultEffect.textContent =
        effectNames[selectedEffect] || "Original";

    emptyResult.hidden = true;
    resultContainer.hidden = false;

    showMessage(
        "Fotografia capturada e processada com sucesso!",
        "success"
    );

    // Leva o resultado à área visível da página.
    document.getElementById("resultContainer").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

// ========================================
// 8. BOTÃO DE CAPTURA
// ========================================

captureButton.addEventListener("click", capturePhoto);

// ========================================
// 9. BAIXAR A FOTOGRAFIA
// ========================================

downloadButton.addEventListener("click", () => {
    if (!canvas.width || !canvas.height) {
        showMessage(
            "Capture uma fotografia antes de realizar o download.",
            "error"
        );
        return;
    }

    const link = document.createElement("a");

    const safeName = (identificationInput.value.trim() || "captura")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 40);

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    link.download = `CaptureID_${safeName}_${timestamp}.png`;
    link.href = canvas.toDataURL("image/png");

    document.body.appendChild(link);
    link.click();
    link.remove();
});

// ========================================
// 10. ESTADO INICIAL
// ========================================

updateCameraInterface(false);
showMessage("Clique em “Ligar câmera” para começar.");

// Encerra o recurso quando a página for fechada ou abandonada.
window.addEventListener("pagehide", () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
});