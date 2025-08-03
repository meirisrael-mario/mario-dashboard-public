document.addEventListener("DOMContentLoaded", () => {
  const plusBtn = document.getElementById("addSupplierBtn");
  const supplierCard = document.getElementById("supplierCard");

  if (plusBtn && supplierCard) {
    plusBtn.addEventListener("click", () => {
      supplierCard.classList.toggle("hidden");
    });
  }
});

    });
  }

  // כפתור תיקיית ספקים
  const openSuppliers = document.getElementById("openSuppliers");
  if (openSuppliers) {
    openSuppliers.addEventListener("click", () => {
      const suppliers = JSON.parse(localStorage.getItem("suppliers") || "[]");
      if (suppliers.length === 0) {
        alert("אין ספקים שמורים.");
        return;
      }

      const list = suppliers.map(s => `• ${s.name} (${s.businessId})`).join('\n');
      alert("ספקים שמורים:\n\n" + list);
    });
  }

  // כפתור תיקיית לקוחות (כרגע מדומה)
  const openClients = document.getElementById("openClients");
  if (openClients) {
    openClients.addEventListener("click", () => {
      alert("תיקיית לקוחות תיפתח כאן בהמשך (TODO)");
    });
  }

  // שמירת ספק ל-localStorage
  const saveSupplierBtn = document.getElementById("saveSupplierBtn");
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

      const existing = JSON.parse(localStorage.getItem("suppliers") || "[]");
      existing.push(supplier);
      localStorage.setItem("suppliers", JSON.stringify(existing));

      document.getElementById("supplierInput").value = supplier.name;
      document.getElementById("supplierCard").classList.add("hidden");
      alert("ספק נשמר בהצלחה");
    });
  }
});
