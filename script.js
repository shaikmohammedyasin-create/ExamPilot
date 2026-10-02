// ExamPilot - Main Application Script
// Plain JavaScript without external libraries

// In-memory list to store added subjects
let addedSubjects = [];

// Global set to store completed question IDs
// Format: `${subjectId}__u${unit}__${type}__${index}`
const completedQuestions = new Set();

// Current generated study plan grouped by date
let currentPlanByDate = null;

// LocalStorage Keys
const STORAGE_KEYS = {
  SUBJECTS: "exampilot_subjects",
  PLAN: "exampilot_plan",
  COMPLETED_QUESTIONS: "exampilot_completed_questions",
  TICKED_DATES: "exampilot_ticked_dates",
};

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(addedSubjects));
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(currentPlanByDate || {}));
    localStorage.setItem(STORAGE_KEYS.COMPLETED_QUESTIONS, JSON.stringify(Array.from(completedQuestions)));
  } catch (e) {
    console.error("Could not save to localStorage", e);
  }
}

// Load state from localStorage
function loadState() {
  try {
    const savedSubj = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (savedSubj) {
      addedSubjects = JSON.parse(savedSubj) || [];
    }

    const savedCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_QUESTIONS);
    if (savedCompleted) {
      const arr = JSON.parse(savedCompleted) || [];
      completedQuestions.clear();
      arr.forEach((id) => completedQuestions.add(id));
    }

    const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (savedPlan) {
      const parsed = JSON.parse(savedPlan);
      currentPlanByDate = parsed && Object.keys(parsed).length > 0 ? parsed : null;
    }
  } catch (e) {
    console.error("Could not load from localStorage", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const subjectSelect = document.getElementById("subjectSelect");
  const unitCheckboxesContainer = document.getElementById("unitCheckboxes");
  const subjectForm = document.getElementById("subjectForm");
  const examDateInput = document.getElementById("examDate");
  const difficultySelect = document.getElementById("difficulty");
  const subjectCardsList = document.getElementById("subjectCardsList");
  const generatePlanBtn = document.getElementById("generatePlanBtn");
  const planContainer = document.getElementById("planContainer");
  const todayTasksContainer = document.getElementById("todayTasksContainer");
  const todayDateBadge = document.getElementById("todayDateBadge");

  // Helper to safely access EXAM_DATA from data.js
  function getExamData() {
    return (typeof EXAM_DATA !== "undefined" ? EXAM_DATA : window.EXAM_DATA) || [];
  }

  // Set minimum date on exam date picker to today
  const initToday = new Date();
  initToday.setHours(0, 0, 0, 0);
  examDateInput.min = toDateStr(initToday);

  // 1. Populate Subject dropdown from data.js
  function populateSubjectDropdown() {
    const data = getExamData();
    if (!Array.isArray(data) || data.length === 0) {
      console.error("EXAM_DATA not found or invalid.");
      return;
    }

    data.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject.id;
      option.textContent = subject.name;
      subjectSelect.appendChild(option);
    });
  }

  // 2. Render unit checkboxes (all checked by default)
  function renderUnitCheckboxes(unitCount = 5) {
    unitCheckboxesContainer.innerHTML = "";

    for (let u = 1; u <= unitCount; u++) {
      const label = document.createElement("label");
      label.className = "unit-checkbox-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "unit";
      checkbox.value = u;
      checkbox.checked = true; // Checked by default

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(`Unit ${u}`));
      unitCheckboxesContainer.appendChild(label);
    }
  }

  // Update unit checkboxes if the chosen subject has a specific number of units
  subjectSelect.addEventListener("change", () => {
    const selectedSubject = getExamData().find((s) => s.id === subjectSelect.value);
    const unitCount = selectedSubject && selectedSubject.units ? selectedSubject.units.length : 5;
    renderUnitCheckboxes(unitCount);
  });

  // Calculate statistics (total, completed, readiness percent) for a subject
  function getSubjectStats(subjectItem) {
    const data = getExamData();
    const subject = data.find((s) => s.id === subjectItem.subjectId);
    if (!subject) return { total: 0, completed: 0, percent: 0 };

    let total = 0;
    let completed = 0;

    subjectItem.selectedUnits.forEach((uNum) => {
      const unitObj = (subject.units || []).find((u) => u.unit === uNum);
      if (unitObj) {
        const shorts = unitObj.shortQuestions || [];
        const longs = unitObj.longQuestions || [];
        total += shorts.length + longs.length;

        shorts.forEach((_, idx) => {
          const qid = `${subject.id}__u${uNum}__short__${idx}`;
          if (completedQuestions.has(qid)) completed++;
        });
        longs.forEach((_, idx) => {
          const qid = `${subject.id}__u${uNum}__long__${idx}`;
          if (completedQuestions.has(qid)) completed++;
        });
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }

  // Update the top progress bar and readiness values on subject cards
  function updateOverallProgress() {
    const overallProgressBar = document.getElementById("overallProgressBar");
    const overallProgressText = document.getElementById("overallProgressText");
    const overallProgressSubtext = document.getElementById("overallProgressSubtext");

    let grandTotal = 0;
    let grandCompleted = 0;

    addedSubjects.forEach((s) => {
      const stats = getSubjectStats(s);
      grandTotal += stats.total;
      grandCompleted += stats.completed;
    });

    const percent = grandTotal > 0 ? Math.round((grandCompleted / grandTotal) * 100) : 0;

    if (overallProgressBar) overallProgressBar.style.width = `${percent}%`;
    if (overallProgressText) overallProgressText.textContent = `${percent}%`;
    if (overallProgressSubtext) {
      overallProgressSubtext.textContent = `${grandCompleted} of ${grandTotal} questions completed across all subjects`;
    }

    // Update readiness displays on all cards
    addedSubjects.forEach((s) => {
      const cardEl = document.querySelector(`.subject-card[data-id="${s.id}"]`);
      if (cardEl) {
        const stats = getSubjectStats(s);
        const valEl = cardEl.querySelector(".readiness-value");
        const fillEl = cardEl.querySelector(".readiness-fill");
        if (valEl) valEl.textContent = `${stats.percent}% (${stats.completed}/${stats.total})`;
        if (fillEl) fillEl.style.width = `${stats.percent}%`;
      }
    });
  }

  // Streak tracking storage and calculation
  function getTickedDates() {
    try {
      const stored = localStorage.getItem("exampilot_ticked_dates");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  function saveTickedDates(datesSet) {
    try {
      localStorage.setItem("exampilot_ticked_dates", JSON.stringify(Array.from(datesSet)));
    } catch (e) {
      console.error("Could not save streak to localStorage", e);
    }
  }

  function calculateStreak() {
    const datesSet = getTickedDates();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(today);

    let streak = 0;
    // If questions were ticked today, count today plus all consecutive previous days
    if (datesSet.has(todayStr)) {
      streak = 1;
      let checkDate = addDays(today, -1);
      while (datesSet.has(toDateStr(checkDate))) {
        streak++;
        checkDate = addDays(checkDate, -1);
      }
    } else {
      // If no question ticked today yet, show streak of consecutive days ending yesterday
      let checkDate = addDays(today, -1);
      while (datesSet.has(toDateStr(checkDate))) {
        streak++;
        checkDate = addDays(checkDate, -1);
      }
    }
    return streak;
  }

  function updateStreakDisplay() {
    const streakBadge = document.getElementById("streakBadge");
    if (!streakBadge) return;
    const streak = calculateStreak();
    streakBadge.textContent = `🔥 ${streak} Day Streak`;
  }

  function recordQuestionTickedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(today);
    const datesSet = getTickedDates();
    if (!datesSet.has(todayStr)) {
      datesSet.add(todayStr);
      saveTickedDates(datesSet);
    }
    updateStreakDisplay();
  }

  // 3. Render all added subject cards with readiness percentage
  function renderSubjectCards() {
    subjectCardsList.innerHTML = "";

    if (addedSubjects.length === 0) {
      const emptyNotice = document.createElement("p");
      emptyNotice.className = "empty-message";
      emptyNotice.textContent = "No subjects added yet. Add a subject using the form above.";
      subjectCardsList.appendChild(emptyNotice);
      updateOverallProgress();
      return;
    }

    addedSubjects.forEach((subjectItem) => {
      const stats = getSubjectStats(subjectItem);

      const card = document.createElement("article");
      card.className = "subject-card";
      card.setAttribute("data-id", subjectItem.id);

      // Card Header with Name
      const cardHeader = document.createElement("div");
      cardHeader.className = "subject-card-header";

      const title = document.createElement("h3");
      title.className = "subject-card-title";
      title.textContent = subjectItem.name;
      cardHeader.appendChild(title);

      // Card Details List
      const detailsList = document.createElement("ul");
      detailsList.className = "subject-card-details";

      // Calculate Days Left until exam
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examParts = subjectItem.examDate.split("-");
      const examDate = new Date(parseInt(examParts[0], 10), parseInt(examParts[1], 10) - 1, parseInt(examParts[2], 10));
      examDate.setHours(0, 0, 0, 0);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysLeft = Math.round((examDate - today) / msPerDay);

      // If fewer than 3 days remain, make the card red
      const isUrgent = daysLeft < 3;
      if (isUrgent) {
        card.classList.add("subject-card-urgent");
      }

      let daysLeftText = "";
      if (daysLeft < 0) {
        daysLeftText = `Passed (${Math.abs(daysLeft)}d ago)`;
      } else if (daysLeft === 0) {
        daysLeftText = "Today!";
      } else if (daysLeft === 1) {
        daysLeftText = "1 day left";
      } else {
        daysLeftText = `${daysLeft} days left`;
      }

      // Exam Date
      const dateItem = document.createElement("li");
      dateItem.innerHTML = `<strong>Exam Date:</strong> ${subjectItem.examDate}`;
      detailsList.appendChild(dateItem);

      // Days Left
      const daysItem = document.createElement("li");
      daysItem.innerHTML = `<strong>Days Left:</strong> <span class="days-left-badge ${isUrgent ? "urgent" : "normal"}">${daysLeftText}</span>`;
      detailsList.appendChild(daysItem);

      // Difficulty
      const diffItem = document.createElement("li");
      diffItem.innerHTML = `<strong>Difficulty:</strong> ${subjectItem.difficulty} / 5`;
      detailsList.appendChild(diffItem);

      // Number of Units
      const unitsItem = document.createElement("li");
      unitsItem.innerHTML = `<strong>Number of Units:</strong> ${subjectItem.selectedUnits.length}`;
      detailsList.appendChild(unitsItem);

      // Readiness Percentage Section
      const readinessBox = document.createElement("div");
      readinessBox.className = "subject-card-readiness";
      readinessBox.innerHTML = `
        <div class="readiness-header-row">
          <span class="readiness-title">Readiness</span>
          <span class="readiness-value">${stats.percent}% (${stats.completed}/${stats.total})</span>
        </div>
        <div class="readiness-track">
          <div class="readiness-fill" style="width: ${stats.percent}%;"></div>
        </div>
      `;

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-delete";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        deleteSubject(subjectItem.id);
      });

      // Assemble Card
      card.appendChild(cardHeader);
      card.appendChild(detailsList);
      card.appendChild(readinessBox);
      card.appendChild(deleteBtn);

      subjectCardsList.appendChild(card);
    });

    updateOverallProgress();
  }

  // 4. Handle deleting a subject card
  function deleteSubject(id) {
    const deleted = addedSubjects.find((s) => s.id === id);
    addedSubjects = addedSubjects.filter((s) => s.id !== id);

    // If current plan exists, remove tasks for this deleted subject
    if (currentPlanByDate && deleted) {
      for (const d in currentPlanByDate) {
        currentPlanByDate[d] = currentPlanByDate[d].filter((t) => t.subjectId !== deleted.subjectId);
        if (currentPlanByDate[d].length === 0) {
          delete currentPlanByDate[d];
        }
      }
      const todayStr = toDateStr(new Date());
      renderTodaySection(currentPlanByDate[todayStr] || []);
      renderPlan(currentPlanByDate);
    }

    renderSubjectCards();
    updateOverallProgress();
    saveState();
  }

  const formErrorMessage = document.getElementById("formErrorMessage");

  function showFormError(message) {
    if (!formErrorMessage) return;
    formErrorMessage.textContent = "⚠️ " + message;
    formErrorMessage.style.display = "block";
    formErrorMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearFormError() {
    if (!formErrorMessage) return;
    formErrorMessage.textContent = "";
    formErrorMessage.style.display = "none";
  }

  // Clear error banner on user interactions
  subjectSelect.addEventListener("change", clearFormError);
  examDateInput.addEventListener("input", clearFormError);
  unitCheckboxesContainer.addEventListener("change", clearFormError);

  // 5. Handle form submission to add a subject with robust validations
  subjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormError();

    // 1. Check if a subject is selected
    const selectedSubjectId = subjectSelect.value;
    const selectedSubject = getExamData().find((s) => s.id === selectedSubjectId);

    if (!selectedSubject) {
      showFormError("Please select a subject from the dropdown.");
      return;
    }

    // 2. Check exam date is provided
    if (!examDateInput.value) {
      showFormError("Please select an exam date.");
      return;
    }

    // 3. Check exam date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examParts = examDateInput.value.split("-");
    const examDate = new Date(parseInt(examParts[0], 10), parseInt(examParts[1], 10) - 1, parseInt(examParts[2], 10));
    examDate.setHours(0, 0, 0, 0);

    if (isNaN(examDate.getTime())) {
      showFormError("Invalid exam date entered. Please choose a valid date.");
      return;
    }

    if (examDate < today) {
      showFormError("The selected exam date is in the past. Please choose a future exam date.");
      return;
    }

    // 4. Check if at least one unit is ticked
    const checkedCheckboxes = document.querySelectorAll('input[name="unit"]:checked');
    const selectedUnits = Array.from(checkedCheckboxes).map((cb) => parseInt(cb.value, 10));

    if (selectedUnits.length === 0) {
      showFormError("Please tick at least one unit checkbox to include in your study plan.");
      return;
    }

    // 5. Check if subject was already added
    const isAlreadyAdded = addedSubjects.some((s) => s.subjectId === selectedSubject.id);
    if (isAlreadyAdded) {
      showFormError(`"${selectedSubject.name}" is already in your subjects list.`);
      return;
    }

    // Create new subject entry
    const newSubjectEntry = {
      id: Date.now(),
      subjectId: selectedSubject.id,
      name: selectedSubject.name,
      examDate: examDateInput.value,
      difficulty: difficultySelect.value,
      selectedUnits: selectedUnits,
    };

    // Add to list, update UI and persist to localStorage
    addedSubjects.push(newSubjectEntry);
    renderSubjectCards();
    saveState();

    // Reset form and reset checkboxes to all checked
    subjectForm.reset();
    renderUnitCheckboxes(5);
    difficultySelect.value = "3";
    clearFormError();
  });

  // =========================================================
  // PLANNING ENGINE
  // =========================================================

  // Helper to format Date to YYYY-MM-DD
  function toDateStr(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Helper to add days to a Date
  function addDays(d, n) {
    const res = new Date(d);
    res.setDate(res.getDate() + n);
    return res;
  }

  // Helper to format date for display (e.g., "Monday, Oct 5, 2026")
  function formatDisplayDate(dateStr) {
    const parts = dateStr.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Render feasibility warning card
  function renderFeasibilityWarning(infeasibleList) {
    planContainer.innerHTML = "";

    const warningCard = document.createElement("div");
    warningCard.className = "plan-warning-card";

    const title = document.createElement("h3");
    title.className = "plan-warning-title";
    title.textContent = "Plan Infeasible: Not Enough Days";
    warningCard.appendChild(title);

    const intro = document.createElement("p");
    intro.textContent =
      "The following subject(s) have more units than can fit before their exam at the limit of 4 tasks per day (with 2 reserved revision days):";
    warningCard.appendChild(intro);

    const list = document.createElement("ul");
    list.className = "plan-warning-list";

    infeasibleList.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.name}</strong>: Needs at least <strong>${item.minDaysNeeded} days</strong> to fit ${item.unitsCount} unit${item.unitsCount > 1 ? "s" : ""} plus 2 revision days, but only <strong>${item.daysAvailable} day${item.daysAvailable === 1 ? "" : "s"}</strong> remain before the exam (${item.examDate}).`;
      list.appendChild(li);
    });
    warningCard.appendChild(list);

    const suggestion = document.createElement("p");
    suggestion.className = "plan-warning-suggestion";
    suggestion.textContent =
      "Recommendation: Please select fewer units or set a later exam date so all tasks fit within the daily limit of 4 tasks.";
    warningCard.appendChild(suggestion);

    planContainer.appendChild(warningCard);
  }

  // Helper to fetch questions for a specific task from EXAM_DATA with stable IDs
  function getQuestionsForTask(task) {
    const data = getExamData();
    const subject = data.find((s) => s.id === task.subjectId);
    if (!subject) return { shortQuestions: [], longQuestions: [] };

    if (task.type === "study") {
      const unitObj = (subject.units || []).find((u) => u.unit === task.unit);
      if (!unitObj) return { shortQuestions: [], longQuestions: [] };
      const shorts = (unitObj.shortQuestions || []).map((q, idx) => ({
        ...q,
        id: `${subject.id}__u${task.unit}__short__${idx}`,
      }));
      const longs = (unitObj.longQuestions || []).map((q, idx) => ({
        ...q,
        id: `${subject.id}__u${task.unit}__long__${idx}`,
      }));
      return { shortQuestions: shorts, longQuestions: longs };
    } else if (task.type === "revision") {
      const selectedUnits = task.selectedUnits || [];
      const units = (subject.units || []).filter((u) => selectedUnits.includes(u.unit));
      if (task.revisionType === "short") {
        const shorts = [];
        units.forEach((u) => {
          (u.shortQuestions || []).forEach((q, idx) => {
            shorts.push({
              ...q,
              unitNum: u.unit,
              id: `${subject.id}__u${u.unit}__short__${idx}`,
            });
          });
        });
        return { shortQuestions: shorts, longQuestions: [] };
      } else {
        const longs = [];
        units.forEach((u) => {
          (u.longQuestions || []).forEach((q, idx) => {
            longs.push({
              ...q,
              unitNum: u.unit,
              id: `${subject.id}__u${u.unit}__long__${idx}`,
            });
          });
        });
        return { shortQuestions: [], longQuestions: longs };
      }
    }

    return { shortQuestions: [], longQuestions: [] };
  }

  // Reusable component to create an expandable task element
  function createTaskItem(task) {
    const item = document.createElement("details");
    item.className = "plan-task-item";

    // Summary header (clickable to expand/collapse)
    const summary = document.createElement("summary");
    summary.className = "task-summary";

    const summaryMain = document.createElement("div");
    summaryMain.className = "task-summary-main";

    const arrow = document.createElement("span");
    arrow.className = "task-expand-arrow";
    arrow.textContent = "▶";

    const tag = document.createElement("span");
    tag.className = `task-tag ${task.type === "revision" ? "task-tag-revision" : "task-tag-study"}`;
    tag.textContent = task.type === "revision" ? "Revision" : "Study";

    const taskTitle = document.createElement("span");
    taskTitle.className = "task-title";
    taskTitle.textContent = task.title;

    summaryMain.appendChild(arrow);
    summaryMain.appendChild(tag);
    summaryMain.appendChild(taskTitle);

    // Progress counter badge
    const progressBadge = document.createElement("span");
    progressBadge.className = "task-progress-badge";

    summary.appendChild(summaryMain);
    summary.appendChild(progressBadge);
    item.appendChild(summary);

    // Task content body holding questions
    const content = document.createElement("div");
    content.className = "task-content";

    const { shortQuestions, longQuestions } = getQuestionsForTask(task);
    const totalQuestions = shortQuestions.length + longQuestions.length;

    // Render Short Answer Questions
    if (shortQuestions.length > 0) {
      const shortSection = document.createElement("div");
      shortSection.className = "task-q-section";

      const heading = document.createElement("h4");
      heading.className = "task-q-heading";
      heading.textContent = `Short Answer Questions (${shortQuestions.length})`;
      shortSection.appendChild(heading);

      const qList = document.createElement("ul");
      qList.className = "task-q-list";

      shortQuestions.forEach((q) => {
        const qItem = document.createElement("li");
        qItem.className = "task-q-item";

        const label = document.createElement("label");
        label.className = "task-q-label";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "question-checkbox";
        cb.setAttribute("data-qid", q.id);
        cb.checked = completedQuestions.has(q.id);

        const textSpan = document.createElement("span");
        textSpan.className = "q-text";
        textSpan.textContent = (q.unitNum ? `[Unit ${q.unitNum}] ` : "") + q.text;

        const marksBadge = document.createElement("span");
        marksBadge.className = "q-marks";
        marksBadge.textContent = q.marks;

        label.appendChild(cb);
        label.appendChild(textSpan);
        label.appendChild(marksBadge);
        qItem.appendChild(label);
        qList.appendChild(qItem);
      });

      shortSection.appendChild(qList);
      content.appendChild(shortSection);
    }

    // Render Long Answer Questions
    if (longQuestions.length > 0) {
      const longSection = document.createElement("div");
      longSection.className = "task-q-section";

      const heading = document.createElement("h4");
      heading.className = "task-q-heading";
      heading.textContent = `Long Answer Questions (${longQuestions.length})`;
      longSection.appendChild(heading);

      const qList = document.createElement("ul");
      qList.className = "task-q-list";

      longQuestions.forEach((q) => {
        const qItem = document.createElement("li");
        qItem.className = "task-q-item";

        const label = document.createElement("label");
        label.className = "task-q-label";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "question-checkbox";
        cb.setAttribute("data-qid", q.id);
        cb.checked = completedQuestions.has(q.id);

        const textSpan = document.createElement("span");
        textSpan.className = "q-text";
        textSpan.textContent = (q.unitNum ? `[Unit ${q.unitNum}] ` : "") + q.text;

        const marksBadge = document.createElement("span");
        marksBadge.className = "q-marks";
        marksBadge.textContent = q.marks;

        label.appendChild(cb);
        label.appendChild(textSpan);
        label.appendChild(marksBadge);
        qItem.appendChild(label);
        qList.appendChild(qItem);
      });

      longSection.appendChild(qList);
      content.appendChild(longSection);
    }

    if (totalQuestions === 0) {
      const emptyInfo = document.createElement("p");
      emptyInfo.className = "empty-message";
      emptyInfo.textContent = "No questions found for this task.";
      content.appendChild(emptyInfo);
    }

    item.appendChild(content);

    // Update completion state (turns green with strikethrough only when ALL questions ticked)
    function updateSelfCompletion() {
      const allCheckboxes = content.querySelectorAll(".question-checkbox");
      const checkedCheckboxes = content.querySelectorAll(".question-checkbox:checked");
      const total = allCheckboxes.length;
      const checked = checkedCheckboxes.length;

      if (total > 0 && checked === total) {
        item.classList.add("task-completed");
        progressBadge.textContent = "✓ Completed";
      } else {
        item.classList.remove("task-completed");
        progressBadge.textContent = `${checked} / ${total}`;
      }
    }

    // Attach change listener to update completion and synchronize across all sections
    content.addEventListener("change", (e) => {
      if (e.target.classList.contains("question-checkbox")) {
        const qid = e.target.getAttribute("data-qid");
        const isChecked = e.target.checked;

        if (isChecked) {
          completedQuestions.add(qid);
          recordQuestionTickedToday();
        } else {
          completedQuestions.delete(qid);
        }

        // Synchronize all instances of this question checkbox across Today and Plan sections
        document.querySelectorAll(`input[data-qid="${qid}"]`).forEach((input) => {
          input.checked = isChecked;
        });

        // Update all task items in DOM
        document.querySelectorAll(".plan-task-item").forEach((taskEl) => {
          const totalInTask = taskEl.querySelectorAll(".question-checkbox").length;
          const checkedInTask = taskEl.querySelectorAll(".question-checkbox:checked").length;
          const badgeEl = taskEl.querySelector(".task-progress-badge");

          if (totalInTask > 0 && checkedInTask === totalInTask) {
            taskEl.classList.add("task-completed");
            if (badgeEl) badgeEl.textContent = "✓ Completed";
          } else {
            taskEl.classList.remove("task-completed");
            if (badgeEl) badgeEl.textContent = `${checkedInTask} / ${totalInTask}`;
          }
        });

        // Update global progress bar and subject readiness percentages
        updateOverallProgress();
        saveState();
      }
    });

    // Initialize completion status
    updateSelfCompletion();

    return item;
  }

  // Render the Today section
  function renderTodaySection(todayTasks = []) {
    todayTasksContainer.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (todayDateBadge) {
      todayDateBadge.textContent = today.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (todayTasks.length === 0) {
      const msg = document.createElement("p");
      msg.className = "empty-message";
      msg.textContent =
        addedSubjects.length === 0
          ? "No tasks scheduled for today. Add subjects and click 'Generate Plan' to schedule your daily tasks."
          : "No tasks scheduled for today. You are all caught up for today!";
      todayTasksContainer.appendChild(msg);
      return;
    }

    todayTasks.forEach((task) => {
      const taskElement = createTaskItem(task);
      todayTasksContainer.appendChild(taskElement);
    });
  }

  // Core plan generation logic
  function generateStudyPlan() {
    if (addedSubjects.length === 0) {
      planContainer.innerHTML = `
        <div class="form-error-banner" role="alert">
          ⚠️ Please add at least one subject above before generating your study plan.
        </div>
      `;
      planContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    // Set today at midnight (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // =========================================================
    // FEASIBILITY CHECK
    // =========================================================
    const msPerDay = 1000 * 60 * 60 * 24;
    const infeasibleSubjects = [];

    addedSubjects.forEach((subj) => {
      const examParts = subj.examDate.split("-");
      const examDate = new Date(parseInt(examParts[0], 10), parseInt(examParts[1], 10) - 1, parseInt(examParts[2], 10));
      examDate.setHours(0, 0, 0, 0);

      const daysUntilExam = Math.round((examDate - today) / msPerDay);
      const numUnits = subj.selectedUnits.length;

      // 4 tasks per day max for study + 2 revision days
      const studyDaysNeeded = Math.ceil(numUnits / 4);
      const minDaysNeeded = studyDaysNeeded + 2;

      if (daysUntilExam < minDaysNeeded) {
        infeasibleSubjects.push({
          name: subj.name,
          unitsCount: numUnits,
          examDate: subj.examDate,
          daysAvailable: Math.max(0, daysUntilExam),
          minDaysNeeded: minDaysNeeded,
        });
      }
    });

    // If any subject cannot fit, do not create a fake plan
    if (infeasibleSubjects.length > 0) {
      renderFeasibilityWarning(infeasibleSubjects);
      renderTodaySection([]);
      return;
    }

    // Plan structure: dateStr -> Array of tasks (maximum 4 per day)
    const planByDate = {};

    // 1. Sort subjects by difficulty descending (harder subjects shifted earlier)
    const sortedSubjects = [...addedSubjects].sort((a, b) => {
      const diffA = parseInt(a.difficulty, 10);
      const diffB = parseInt(b.difficulty, 10);
      if (diffB !== diffA) {
        return diffB - diffA; // Harder subjects first
      }
      return new Date(a.examDate) - new Date(b.examDate); // Earlier exam dates first
    });

    // 2. Reserve the last 2 days before each exam for revision tasks
    sortedSubjects.forEach((subj) => {
      const examParts = subj.examDate.split("-");
      const examDate = new Date(parseInt(examParts[0], 10), parseInt(examParts[1], 10) - 1, parseInt(examParts[2], 10));
      examDate.setHours(0, 0, 0, 0);

      const dayBefore2 = addDays(examDate, -2);
      const dayBefore1 = addDays(examDate, -1);

      // Revision Day 1 (2 days before exam, if not before today)
      if (dayBefore2 >= today && dayBefore2 < examDate) {
        const dStr = toDateStr(dayBefore2);
        if (!planByDate[dStr]) planByDate[dStr] = [];
        if (planByDate[dStr].length < 4) {
          planByDate[dStr].push({
            type: "revision",
            title: `${subj.name} - Revision Part 1 (Short Questions)`,
            subjectId: subj.subjectId,
            subjectName: subj.name,
            revisionType: "short",
            selectedUnits: subj.selectedUnits,
          });
        }
      }

      // Revision Day 2 (1 day before exam, if not before today)
      if (dayBefore1 >= today && dayBefore1 < examDate) {
        const dStr = toDateStr(dayBefore1);
        if (!planByDate[dStr]) planByDate[dStr] = [];
        if (planByDate[dStr].length < 4) {
          planByDate[dStr].push({
            type: "revision",
            title: `${subj.name} - Revision Part 2 (Long Questions)`,
            subjectId: subj.subjectId,
            subjectName: subj.name,
            revisionType: "long",
            selectedUnits: subj.selectedUnits,
          });
        }
      }
    });

    // 3. Schedule study tasks (each ticked unit is one study task)
    sortedSubjects.forEach((subj) => {
      const examParts = subj.examDate.split("-");
      const examDate = new Date(parseInt(examParts[0], 10), parseInt(examParts[1], 10) - 1, parseInt(examParts[2], 10));
      examDate.setHours(0, 0, 0, 0);

      // Study tasks must end before the 2 revision days (or before exam date if short time)
      let lastStudyDate = addDays(examDate, -2);
      if (lastStudyDate < today) {
        lastStudyDate = addDays(examDate, -1);
      }
      if (lastStudyDate < today) {
        lastStudyDate = today;
      }

      // Collect available study days between today and lastStudyDate (strictly before examDate)
      const availableDates = [];
      let cur = new Date(today);
      while (cur < lastStudyDate && cur < examDate) {
        availableDates.push(new Date(cur));
        cur = addDays(cur, 1);
      }
      if (availableDates.length === 0 && today < examDate) {
        availableDates.push(new Date(today));
      }

      const units = [...subj.selectedUnits].sort((a, b) => a - b);
      const numUnits = units.length;
      const numDays = availableDates.length;
      const diff = parseInt(subj.difficulty, 10);

      units.forEach((unitNum, idx) => {
        let targetIdx = 0;
        if (numDays > 0) {
          // Harder subjects (higher difficulty) are shifted earlier
          const ratio = numUnits > 1 ? idx / (numUnits - 1) : 0;
          const spreadFactor = 0.5 + (5 - diff) * 0.1;
          const offset = (5 - diff) * 0.08;
          const scaledRatio = Math.min(1.0, offset + ratio * spreadFactor);
          targetIdx = Math.min(Math.floor(scaledRatio * numDays), numDays - 1);
        }

        // Find available day with capacity < 4 (strictly before examDate)
        let assignedDateStr = null;

        // Try forward from targetIdx
        for (let d = targetIdx; d < availableDates.length; d++) {
          const dStr = toDateStr(availableDates[d]);
          if (!planByDate[dStr]) planByDate[dStr] = [];
          if (planByDate[dStr].length < 4) {
            assignedDateStr = dStr;
            break;
          }
        }

        // Try backwards from targetIdx - 1
        if (!assignedDateStr) {
          for (let d = targetIdx - 1; d >= 0; d--) {
            const dStr = toDateStr(availableDates[d]);
            if (!planByDate[dStr]) planByDate[dStr] = [];
            if (planByDate[dStr].length < 4) {
              assignedDateStr = dStr;
              break;
            }
          }
        }

        // If all available study days are full (<4 tasks), try pre-exam revision days
        if (!assignedDateStr) {
          let revDay = addDays(examDate, -2);
          while (revDay < examDate) {
            if (revDay >= today) {
              const dStr = toDateStr(revDay);
              if (!planByDate[dStr]) planByDate[dStr] = [];
              if (planByDate[dStr].length < 4) {
                assignedDateStr = dStr;
                break;
              }
            }
            revDay = addDays(revDay, 1);
          }
        }

        // Schedule task if slot found (never on or after exam date)
        if (assignedDateStr) {
          planByDate[assignedDateStr].push({
            type: "study",
            title: `${subj.name} - Unit ${unitNum}`,
            subjectId: subj.subjectId,
            subjectName: subj.name,
            unit: unitNum,
          });
        }
      });
    });

    // 4. Render Today section and the full plan
    currentPlanByDate = planByDate;
    saveState();

    const todayStr = toDateStr(today);
    const todayTasks = planByDate[todayStr] || [];
    renderTodaySection(todayTasks);
    renderPlan(planByDate);
  }

  // Render plan grouped by date with expandable tasks
  function renderPlan(planByDate) {
    planContainer.innerHTML = "";

    const sortedDates = Object.keys(planByDate).sort();

    if (sortedDates.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "empty-message";
      emptyMsg.textContent = "No tasks could be scheduled. Please check that exam dates are in the future.";
      planContainer.appendChild(emptyMsg);
      return;
    }

    sortedDates.forEach((dateStr) => {
      const tasks = planByDate[dateStr];
      if (!tasks || tasks.length === 0) return;

      const dateGroup = document.createElement("div");
      dateGroup.className = "plan-date-group";

      // Date Header
      const header = document.createElement("div");
      header.className = "plan-date-header";

      const title = document.createElement("span");
      title.className = "plan-date-title";
      title.textContent = formatDisplayDate(dateStr);

      const countBadge = document.createElement("span");
      countBadge.className = "plan-date-count";
      countBadge.textContent = `${tasks.length} task${tasks.length > 1 ? "s" : ""}`;

      header.appendChild(title);
      header.appendChild(countBadge);
      dateGroup.appendChild(header);

      // Task list container
      const taskList = document.createElement("div");
      taskList.className = "plan-task-list";

      tasks.forEach((task) => {
        const taskItem = createTaskItem(task);
        taskList.appendChild(taskItem);
      });

      dateGroup.appendChild(taskList);
      planContainer.appendChild(dateGroup);
    });
  }

  // Attach Generate Plan button listener
  generatePlanBtn.addEventListener("click", generateStudyPlan);

  // Initial setup: populate UI and restore saved state from localStorage
  populateSubjectDropdown();
  renderUnitCheckboxes(5);
  loadState();
  renderSubjectCards();

  if (currentPlanByDate && Object.keys(currentPlanByDate).length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(today);
    renderTodaySection(currentPlanByDate[todayStr] || []);
    renderPlan(currentPlanByDate);
  } else {
    renderTodaySection([]);
  }

  updateOverallProgress();
  updateStreakDisplay();
});
