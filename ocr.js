const previewFrame = document.getElementById("previewFrame");
const previewImage = document.getElementById("previewImage");
const previewLabel = document.getElementById("previewLabel");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");
const uploadedFiles = [];

function autoFillForm(text) {
  const lines = text.split('\n');
  const data = {
    supplier: "",
    building: "",
    date: "",
    type: "",
    number: "",
    details: "",
    amount: ""
  };

  for (const line of lines) {
    if (!data.supplier && /לכבוד|ספק/.test(line)) data.supplier = line.trim();
    if (!data.number && /חשבונית.*?(\d{5,})/.test(line)) {
      const match = line.match(/חשבונית.*?(\d{5,})/);
      if (match) data.number = match[1];
    }
    if (!data.date && /(\d{2}[/.-]\d{2}[/.-]\d{4})/.test(line)) {
      const match = line.match(/(\d{2}[/.-]\d{2}[/.-]\d{4})/);
      if (match) data.date = match[1];
    }
    if (!data.amount && /סה.?כ|לתשלום/.test(line)) {
      const match = line.match(/(\d+[.,]?\d*)\s*ש.ח|\₪/);
      if (match) data.amount = match[1];
    }
  }

  document.getElementById("supplierInput").value = data.supplier;
  document.getElementById("numberInput").value = data.number;
  document.getElementById("dateInput").value = data.date;
  document.getElementById("amountInput").value = data.amount;
}

function extractTextFromPDF(file) {
  file.arrayBuffer().then(async (pdfData) => {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    Tesseract.recognize(canvas, 'heb+eng', {
      logger: m => console.log(m)
    }).then(({ data: { text } }) => {
      console.log("OCR from PDF:", text);
      autoFillForm(text);
    });
  });
}

function runOCR(file) {
  if (file.type === "application/pdf") {
    extractTextFromPDF(file);
  } else {
    Tesseract.recognize(file, 'heb+eng', {
      logger: m => console.log(m)
    }).then(({ data: { text } }) => {
      console.log("OCR from image:", text);
      autoFillForm(text);
    });
  }
}

function handleFile(files) {
  for (const file of files) {
    uploadedFiles.push(file);

    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-gray-100 p-2 shadow rounded cursor-pointer";

    const span = document.createElement("span");
    span.textContent = file.name;
    span.className = "flex-1";

    span.onclick = () => {
      const url = URL.createObjectURL(file);
      previewLabel.textContent = file.name;
      previewPlaceholder.style.display = "none";
      previewFrame.style.display = "none";
      previewImage.style.display = "none";

      if (file.type === "application/pdf") {
        previewFrame.src = url;
        previewFrame.style.display = "block";
      } else if (file.type.startsWith("image/")) {
        previewImage.src = url;
        previewImage.style.display = "block";
      } else {
        previewPlaceholder.textContent = "לא ניתן להציג תצוגה מקדימה";
        previewPlaceholder.style.display = "block";
      }

      runOCR(file); // OCR רץ אוטומטית
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "text-red-500 ml-2";
    deleteBtn.onclick = () => li.remove();

    li.appendChild(span);
    li.appendChild(deleteBtn);
    fileList.appendChild(li);

    // טריגר OCR כבר בהעלאה, בלי לחכות ללחיצה
    const url = URL.createObjectURL(file);
    runOCR(file);
  }
}

fileInput.addEventListener("change", (e) => handleFile(e.target.files));
dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("bg-blue-50"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("bg-blue-50"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("bg-blue-50");
  handleFile(e.dataTransfer.files);
});
