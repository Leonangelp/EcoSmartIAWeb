
let model, webcam, isCameraOn = true;
const modelURL = "./model.json";
const metadataURL = "./metadata.json";

async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  const flip = true;
  webcam = new tmImage.Webcam(300, 225, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
  document.getElementById("webcam").appendChild(webcam.canvas);
}

async function loop() {
  if (isCameraOn) {
    webcam.update();
    await predict(webcam.canvas);
  }
  window.requestAnimationFrame(loop);
}

async function predict(source) {
  const prediction = await model.predict(source);
  prediction.sort((a, b) => b.probability - a.probability);
  const labelContainer = document.getElementById("label-container");
  const resultText = document.getElementById("result-text");

  labelContainer.innerHTML = "";
  resultText.innerHTML = `Parece que tu desecho es <strong>${prediction[0].className}</strong>`;

  prediction.forEach(p => {
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = (p.probability * 100).toFixed(0) + "%";
    fill.textContent = `${p.className} ${(p.probability * 100).toFixed(0)}%`;
    bar.appendChild(fill);
    labelContainer.appendChild(bar);
  });
}

function toggleCamera() {
  isCameraOn = !isCameraOn;
}

function handleUpload(input) {
  const img = document.getElementById("uploaded-image");
  const file = input.files[0];
  if (file) {
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      document.getElementById("webcam").style.display = "none";
      img.style.display = "block";
      predict(img);
    };
  }
}

init();
