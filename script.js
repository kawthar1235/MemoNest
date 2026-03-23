const yearDisplay = document.getElementById("yearDisplay");
const monthYear = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const entryModal = document.getElementById("entryModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const selectedDateTitle = document.getElementById("selectedDateTitle");

const entryView = document.getElementById("entryView");
const viewTitle = document.getElementById("viewTitle");
const viewImage = document.getElementById("viewImage");
const viewImageContainer = document.getElementById("viewImageContainer");
const viewNote = document.getElementById("viewNote");
const editEntryBtn = document.getElementById("editEntryBtn");
const deleteEntryBtn = document.getElementById("deleteEntryBtn");

const entryForm = document.getElementById("entryForm");
const entryTitle = document.getElementById("entryTitle");
const entryImage = document.getElementById("entryImage");
const entryNote = document.getElementById("entryNote");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

const fallingPhotos = document.getElementById("fallingPhotos");
const openCalendarBtn = document.getElementById("openCalendarBtn");
const openUploadBtn = document.getElementById("openUploadBtn");
const calendarSection = document.getElementById("calendarSection");

let currentDate = new Date();
let selectedDateKey = "";
let selectedImageData = "";

let entries = JSON.parse(localStorage.getItem("memoNestEntries")) || {};

yearDisplay.textContent = new Date().getFullYear();

renderCalendar();
renderFallingPhotos();

prevMonthBtn.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

openCalendarBtn.addEventListener("click", function () {
  calendarSection.scrollIntoView({ behavior: "smooth" });
});

openUploadBtn.addEventListener("click", function () {
  const today = new Date();
  openModal(today);
});

closeModalBtn.addEventListener("click", closeModal);

entryModal.addEventListener("click", function (e) {
  if (e.target === entryModal) {
    closeModal();
  }
});

editEntryBtn.addEventListener("click", function () {
  showEditMode();
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

  let title = entryTitle.value.trim();
  title = title ? title.split(/\s+/)[0] : "";

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
  renderFallingPhotos();
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
  renderFallingPhotos();
});

function renderFallingPhotos() {
  const allEntries = Object.values(entries).filter((entry) => entry.image);

  fallingPhotos.innerHTML = "";

  if (allEntries.length === 0) return;

  const fallingList = allEntries.slice(-10).reverse();

  fallingList.forEach((entry) => {
    const img = document.createElement("img");
    img.classList.add("falling-photo");
    img.src = entry.image;
    img.alt = "Falling memory";

    img.style.left = `${Math.random() * 85}%`;
    img.style.animationDuration = `${9 + Math.random() * 5}s, ${3 + Math.random() * 2}s`;
    img.style.animationDelay = `${Math.random() * 4}s, ${Math.random() * 2}s`;

    fallingPhotos.appendChild(img);
  });
}

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

    const topRow = document.createElement("div");
    topRow.classList.add("day-top");

    const dayNumber = document.createElement("span");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = day;
    topRow.appendChild(dayNumber);

    if (entries[dateKey] && entries[dateKey].title) {
      const titlePreview = document.createElement("span");
      titlePreview.classList.add("day-title");
      titlePreview.textContent = entries[dateKey].title.split(/\s+/)[0];
      topRow.appendChild(titlePreview);
    }

    dayCell.appendChild(topRow);

    if (entries[dateKey] && entries[dateKey].image) {
      const img = document.createElement("img");
      img.classList.add("day-image");
      img.src = entries[dateKey].image;
      img.alt = "Memory";
      dayCell.appendChild(img);
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
    showViewMode(existingEntry);
  } else {
    prepareEmptyForm();
    showEditMode();
  }

  entryModal.classList.remove("hidden");
}

function showViewMode(entry) {
  entryView.classList.remove("hidden");
  entryForm.classList.add("hidden");

  viewTitle.textContent = entry.title || "Untitled";

  if (entry.image) {
    viewImage.src = entry.image;
    viewImageContainer.classList.remove("hidden");
  } else {
    viewImage.src = "";
    viewImageContainer.classList.add("hidden");
  }

  viewNote.innerHTML = entry.note || "<p>No note for this day.</p>";
}

function showEditMode() {
  entryView.classList.add("hidden");
  entryForm.classList.remove("hidden");

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
    prepareEmptyForm();
  }

  entryImage.value = "";
}

function prepareEmptyForm() {
  entryTitle.value = "";
  entryNote.innerHTML = "";
  selectedImageData = "";
  entryImage.value = "";
  hidePreview();
}

function closeModal() {
  entryModal.classList.add("hidden");
  entryView.classList.add("hidden");
  entryForm.classList.remove("hidden");
  prepareEmptyForm();
  viewTitle.textContent = "";
  viewImage.src = "";
  viewImageContainer.classList.add("hidden");
  viewNote.innerHTML = "";
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