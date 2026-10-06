# ExamPilot 🎓

> **Your exam plan built from your own question bank.**

---

### 🔗 Links & Evidence

- **Live Demo:** https://shaikmohammedyasin-create.github.io/ExamPilot/
- **GitHub Repository:** https://github.com/shaikmohammedyasin-create/ExamPilot
- **Demo Video:** Public demo video submitted through the Wispr Flow HH Goa '26 task form.

![Wispr Flow Usage Screenshot](whisper-flow-usage.png)

*Wispr Flow dictation evidence from the development workflow.*

---

## ⚡ One-Line Pitch

ExamPilot is a zero-dependency, voice-built study planner that converts university question banks into structured, daily exam-preparation schedules tailored to difficulty and remaining days.

## ✨ Features

- **Question Bank Integration:** Pre-loaded with question banks across 4 subjects: Deep Learning, Optimization Techniques, Embedded Systems, and Human Resources & Project Management.
- **Smart Planning Engine:** Spreads study tasks across available days, schedules harder subjects earlier, limits each day to 4 tasks, and reserves the final 2 days before each exam for revision.
- **Feasibility & Timeline Guard:** Detects when a requested plan cannot fit the available study time and explains the minimum time required.
- **Interactive Question Checklists:** Each task expands into its short and long questions with individual completion checkboxes.
- **Live Progress & Readiness:** Tracks overall question completion, subject readiness, and today's tasks.
- **Daily Streak Counter:** Tracks consecutive study days on which at least one question is completed.
- **Urgent Exam Highlighting:** Flags subjects with fewer than 3 days remaining.
- **Local Storage Persistence:** Saves subjects, plans, completed questions, and streak data locally.
- **Responsive Dark UI:** Designed for desktop and mobile use.
- **Zero Dependencies:** Plain HTML, CSS, and JavaScript with no external libraries or build step.

## 🚀 How to Run It

ExamPilot requires no installation or backend.

1. Clone or download this repository:
   ```bash
   git clone https://github.com/shaikmohammedyasin-create/ExamPilot.git
   cd ExamPilot
   ```
2. Open `index.html` in a modern browser, or run:
   ```bash
   python -m http.server 8000
   ```
3. Visit `http://localhost:8000`.

## 🎙️ Built with My Voice

ExamPilot was built using **Wispr Flow voice dictation** as the primary input method for the development workflow. The repository records the voice-driven prompts used to create and refine the application in [prompts.md](prompts.md), and includes a Wispr Flow usage screenshot as evidence.

## 📝 Questions & Usage

The question data included in the application was extracted from KHIT (Kallam Haranadhareddy Institute of Technology) question-bank/model-paper material supplied for this project. The application is intended for personal study, revision tracking, and academic preparation.

Raw source documents are excluded from version control through `.gitignore`. The extracted question data required by the application is stored in `data.js`.

## 🔒 Security

ExamPilot is a client-side static application and does not require API keys, backend credentials, or external service secrets.
