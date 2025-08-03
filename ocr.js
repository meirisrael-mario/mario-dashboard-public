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

      runOCR(file);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "text-red-500 ml-2";
    deleteBtn.onclick = () => li.remove();

    li.appendChild(span);
    li.appendChild(deleteBtn);
    fileList.appendChild(li);

    runOCR(file);
  }
}

fileInput.addEventListener("change", (e) => handleFile(e.target.files));
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("bg-blue-50");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("bg-blue-50");
});
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("bg-blue-50");
  handleFile(e.dataTransfer.files);
});
document.addEventListener("DOMContentLoaded", () => {
  const plusBtn = document.getElementById("addSupplierBtn");
  const supplierCard = document.getElementById("supplierCard");

  if (plusBtn && supplierCard) {
    plusBtn.addEventListener("click", () => {
      supplierCard.classList.toggle("hidden");
    });
  }

  const openSuppliers = document.getElementById("openSuppliers");
  const openClients = document.getElementById("openClients");
  const saveSupplierBtn = document.getElementById("saveSupplierBtn");

  if (openSuppliers) {
    openSuppliers.addEventListener("click", () => {
      alert("תיקיית ספקים תיפתח כאן בהמשך (TODO)");
    });
  }

  if (openClients) {
    openClients.addEventListener("click", () => {
      alert("תיקיית לקוחות תיפתח כאן בהמשך (TODO)");
    });
  }

  if (saveSupplierBtn) {
    saveSupplierBtn.addEventListener("click", () => {
      const inputs = document.querySelectorAll("#supplierCard input");

      const supplier = {
        name: inputs[0].value,
        businessId: inputs[1].value,
        address: inputs[2].value,
        contact: inputs[3].value,
        phone: inputs[4].value,
        email: inputs[5].value,
      };

      const blob = new Blob([JSON.stringify(supplier, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${supplier.name || 'supplier'}.json`;
      a.click();
      URL.revokeObjectURL(url);

      document.getElementById("supplierInput").value = supplier.name;
      document.getElementById("supplierCard").classList.add("hidden");
      alert("ספק נשמר בהצלחה");
    });
  }
});

