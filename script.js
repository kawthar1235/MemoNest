const monthYear = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const entryModal = document.getElementById("entryModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const entryForm = document.getElementById("entryForm");
const entryTitle = document.getElementById("entryTitle");
const entryImage = document.getElementById("entryImage");
const entryNote = document.getElementById("entryNote");
const deleteEntryBtn = document.getElementById("deleteEntryBtn");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

let currentDate = new Date();
let selectedDateKey = "";
let selectedImageData = "";

let entries = JSON.parse(localStorage.getItem("memoNestEntries")) || {};

renderCalendar();

prevMonthBtn.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

closeModalBtn.addEventListener("click", closeModal);

entryModal.addEventListener("click", function (e) {
  if (e.target === entryModal) {
    closeModal();
  }
});

entryImage.addEventListener("change", function () {
  const file = entryImage.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    selectedImageData = reader.result;
    showPreview(selectedImageData);
  };

  reader.readAsDataURL(file);
});

entryForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = entryTitle.value.trim();
  const note = entryNote.innerHTML.trim();

  if (!title && !selectedImageData && !note) {
    alert("Please add at least a title, image, or note.");
    return;
  }

  entries[selectedDateKey] = {
    title: title,
    image: selectedImageData || "",
    note: note
  };

  saveEntries();
  closeModal();
  renderCalendar();
});

deleteEntryBtn.addEventListener("click", function () {
  if (!selectedDateKey || !entries[selectedDateKey]) {
    closeModal();
    return;
  }

  delete entries[selectedDateKey];
  saveEntries();
  closeModal();
  renderCalendar();
});

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = firstDayOfMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < startingDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day-cell", "other-month");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("day-cell");

    const dateObj = new Date(year, month, day);
    const dateKey = formatDateKey(dateObj);

    const today = new Date();
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayCell.classList.add("today");
    }

    if (entries[dateKey]) {
      dayCell.classList.add("has-entry");
    }

    const dayNumber = document.createElement("div");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

   if (entries[dateKey]) {
  const entry = entries[dateKey];

  // التايتل
  if (entry.title) {
    const titlePreview = document.createElement("div");
    titlePreview.classList.add("day-title");
    titlePreview.textContent = entry.title;
    dayCell.appendChild(titlePreview);
  }


  if (entry.image) {
    const img = document.createElement("img");
    img.classList.add("day-image");
    img.src = entry.image;
    img.alt = "Memory";
    dayCell.appendChild(img);
  }
}

    dayCell.addEventListener("click", function () {
      openModal(dateObj);
    });

    calendarGrid.appendChild(dayCell);
  }
}

function openModal(dateObj) {
  selectedDateKey = formatDateKey(dateObj);

  selectedDateTitle.textContent = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const existingEntry = entries[selectedDateKey];

  if (existingEntry) {
    entryTitle.value = existingEntry.title || "";
    entryNote.innerHTML = existingEntry.note || "";
    selectedImageData = existingEntry.image || "";

    if (selectedImageData) {
      showPreview(selectedImageData);
    } else {
      hidePreview();
    }
  } else {
    entryTitle.value = "";
    entryNote.innerHTML = "";
    selectedImageData = "";
    entryImage.value = "";
    hidePreview();
  }

  entryModal.classList.remove("hidden");
}

function closeModal() {
  entryModal.classList.add("hidden");
  entryForm.reset();
  entryTitle.value = "";
  entryNote.innerHTML = "";
  entryImage.value = "";
  hidePreview();
}

function showPreview(src) {
  imagePreview.src = src;
  imagePreviewContainer.classList.add("show");
}

function hidePreview() {
  imagePreview.src = "";
  imagePreviewContainer.classList.remove("show");
}

function formatDateKey(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function saveEntries() {
  localStorage.setItem("memoNestEntries", JSON.stringify(entries));
}

function formatNote(command, value = null) {
  entryNote.focus();
  document.execCommand(command, false, value);
}

function setNoteBlock(tag) {
  entryNote.focus();
  document.execCommand("formatBlock", false, tag);
}