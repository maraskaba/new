const STEP_COUNT = 5;
let currentStep = 0;

const stepPanels = document.querySelectorAll("[data-step-panel]");
const navItems = document.querySelectorAll(".step-nav-item");
const progressBar = document.getElementById("progress-bar");
const backBtn = document.getElementById("back-btn");
const continueBtn = document.getElementById("continue-btn");
const skipBtn = document.getElementById("skip-btn");

function renderNav() {
  navItems.forEach((item) => {
    const index = Number(item.dataset.navIndex);
    const marker = item.querySelector(".step-marker");
    const label = item.querySelector(".step-label");

    if (index < currentStep) {
      marker.className = "step-marker flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-indigo-100 text-indigo-600";
      marker.innerHTML = `<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;
      label.className = "step-label text-sm text-gray-900";
    } else if (index === currentStep) {
      marker.className = "step-marker flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-gray-900 text-white";
      marker.textContent = String(index + 1);
      label.className = "step-label text-sm font-semibold text-gray-900";
    } else {
      marker.className = "step-marker flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold border border-gray-300 text-gray-400";
      marker.textContent = String(index + 1);
      label.className = "step-label text-sm text-gray-400";
    }
  });

  progressBar.style.width = `${((currentStep + 1) / STEP_COUNT) * 100}%`;
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(STEP_COUNT - 1, index));

  stepPanels.forEach((panel) => {
    panel.classList.toggle("hidden", Number(panel.dataset.stepPanel) !== currentStep);
  });

  skipBtn.classList.toggle("hidden", currentStep !== 3);
  renderNav();
  window.scrollTo({ top: 0 });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showStep(Number(item.dataset.navIndex)));
});

backBtn.addEventListener("click", () => {
  if (currentStep === 0) {
    window.location.href = "index.html";
  } else {
    showStep(currentStep - 1);
  }
});

continueBtn.addEventListener("click", () => showStep(currentStep + 1));
skipBtn.addEventListener("click", () => showStep(currentStep + 1));

// --- Option cards (single-select groups) ---
const CHECK_ICON = `<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

function selectOption(group, value) {
  document.querySelectorAll(`[data-group="${group}"]`).forEach((card) => {
    const isSelected = card.dataset.value === value;
    const indicator = card.querySelector(".radio-indicator");
    const icon = card.querySelector(".option-icon");

    card.classList.toggle("border-indigo-600", isSelected);
    card.classList.toggle("ring-1", isSelected);
    card.classList.toggle("ring-indigo-600", isSelected);
    card.classList.toggle("border-gray-200", !isSelected);

    indicator.classList.toggle("bg-indigo-600", isSelected);
    indicator.classList.toggle("border-indigo-600", isSelected);
    indicator.classList.toggle("text-white", isSelected);
    indicator.classList.toggle("border-gray-300", !isSelected);
    indicator.innerHTML = isSelected ? CHECK_ICON : "";

    if (icon) {
      icon.classList.toggle("bg-indigo-100", isSelected);
      icon.classList.toggle("text-indigo-600", isSelected);
      icon.classList.toggle("text-gray-400", !isSelected);
    }
  });
}

document.querySelectorAll("[data-group]").forEach((card) => {
  card.addEventListener("click", () => selectOption(card.dataset.group, card.dataset.value));
});

// Defaults matching the reference screenshots
selectOption("profile-type", "company");
selectOption("legal-rep", "no");
selectOption("tax-residency", "us");

// --- Generic upload row (ID document / W9 form) ---
const DOCUMENT_ICON = `
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
`;

function initUploadRow(root, onFileSelected) {
  const fileInput = root.querySelector('[data-role="file-input"]');
  const emptyView = root.querySelector('[data-role="empty-view"]');
  const filledView = root.querySelector('[data-role="filled-view"]');
  const browseTrigger = root.querySelector('[data-role="browse-trigger"]');
  const replaceTrigger = root.querySelector('[data-role="replace-trigger"]');
  const deleteTrigger = root.querySelector('[data-role="delete-trigger"]');
  const fileNameEl = root.querySelector('[data-role="file-name"]');
  const filledThumbnail = filledView.querySelector('[data-role="thumbnail-slot"]');

  function openPicker(event) {
    event.stopPropagation();
    fileInput.click();
  }

  function setFilled(file) {
    root.dataset.state = "filled";
    emptyView.classList.add("hidden");
    filledView.classList.remove("hidden");
    fileNameEl.textContent = file.name;

    filledThumbnail.innerHTML = file.type.startsWith("image/")
      ? `<img src="${URL.createObjectURL(file)}" class="h-full w-full object-cover" alt="" />`
      : DOCUMENT_ICON;

    if (onFileSelected) onFileSelected();
  }

  function setEmpty() {
    root.dataset.state = "empty";
    filledView.classList.add("hidden");
    emptyView.classList.remove("hidden");
    fileInput.value = "";
  }

  browseTrigger.addEventListener("click", openPicker);
  emptyView.addEventListener("click", openPicker);
  if (replaceTrigger) replaceTrigger.addEventListener("click", openPicker);
  if (deleteTrigger) deleteTrigger.addEventListener("click", setEmpty);

  fileInput.addEventListener("change", () => {
    const [file] = fileInput.files;
    if (file) setFilled(file);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    emptyView.addEventListener(eventName, (event) => {
      event.preventDefault();
      emptyView.classList.add("border-indigo-400", "bg-indigo-50");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    emptyView.addEventListener(eventName, (event) => {
      event.preventDefault();
      emptyView.classList.remove("border-indigo-400", "bg-indigo-50");
    });
  });

  emptyView.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (file) setFilled(file);
  });
}

// --- Progressive disclosure on Personal information step ---
const legalNameSection = document.getElementById("legal-name-section");
const personalDetailsSection = document.getElementById("personal-details-section");
const editLegalNameBtn = document.getElementById("edit-legal-name");
const idDocHelper = document.getElementById("id-doc-helper");

function setSectionMuted(section, muted) {
  section.querySelectorAll(".section-heading").forEach((el) => {
    el.classList.toggle("text-gray-400", muted);
    el.classList.toggle("text-gray-900", !muted);
  });
  section.querySelectorAll(".section-subtext").forEach((el) => {
    el.classList.toggle("text-gray-300", muted);
    el.classList.toggle("text-gray-500", !muted);
  });
}

function setInputsDisabled(inputs, disabled) {
  inputs.forEach((el) => {
    el.disabled = disabled;
    el.classList.toggle("bg-gray-50", disabled);
    el.classList.toggle("border-gray-200", disabled);
    el.classList.toggle("text-gray-400", disabled);
    el.classList.toggle("border-gray-300", !disabled);
    el.classList.toggle("text-gray-900", !disabled);
  });
}

function setSectionLocked(section, locked) {
  setSectionMuted(section, locked);
  setInputsDisabled(section.querySelectorAll("input, textarea"), locked);
}

function unlockPersonalInfoSteps() {
  // The legal name fields stay read-only until "Edit" is clicked;
  // unlocking only reveals/activates the section, not direct editing.
  setSectionMuted(legalNameSection, false);
  setSectionLocked(personalDetailsSection, false);
  editLegalNameBtn.disabled = false;
  idDocHelper.textContent = "We accept driver's licenses, state or national ID cards, and passports.";
}

setSectionLocked(legalNameSection, true);
setSectionLocked(personalDetailsSection, true);

initUploadRow(document.getElementById("id-upload"), unlockPersonalInfoSteps);
initUploadRow(document.getElementById("w9-upload"));

editLegalNameBtn.addEventListener("click", () => {
  const inputs = legalNameSection.querySelectorAll("input");
  const nowEditable = inputs[0].disabled;
  setInputsDisabled(inputs, !nowEditable);
});

showStep(0);
