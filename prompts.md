# ExamPilot - Voice Prompts Log

Every prompt below was dictated using **Wispr Flow** during the ExamPilot development workflow.

0. I am building a small project called ExamPilot entirely by voice, so my instructions may contain small speech errors. Interpret them sensibly. Rules for this project. Use only plain HTML, CSS and JavaScript, with no frameworks and no external libraries. Keep the code simple and well commented. After every change, tell me in one or two sentences what you changed and how to test it. Do not add features I did not ask for. If something is unclear, make the simplest reasonable choice and continue without asking me questions.

1. Create three files: index.html, style.css and script.js. Add a header with the app name ExamPilot and the tagline, Your exam plan, built from your own question bank. Add a small line under it that says, Made for KHIT final year students.

2. Role. You are helping me build a study planner called ExamPilot. In this step, your job is to turn my college question banks into one clean data file. Context. The folder named source has four files: a Deep Learning question bank, an Optimization Techniques question bank, an Embedded Systems model question paper, and a Human Resources and Project Management question bank. Each subject has five units. The Embedded Systems paper has no units, so use its five course outcomes, CO1 to CO5, as the five units. Task. Create a file called data.js. For every subject and every unit, store the short answer questions and the long answer questions as text, with their marks. If you cannot read a file directly, use a command line tool to extract its text first. Example. One unit should hold a unit number, a list of short questions, and a list of long questions with marks. Important. Only copy questions that exist in the files. Never invent, shorten or reword a question. If a unit looks empty, tell me instead of filling it.

3. Check data.js. For each subject, tell me how many units, short questions and long questions it has, and point out any unit that looks empty or wrong. Fix any problems by reading the source files again.

4. Add a form where I pick a subject from a dropdown built from data.js, choose an exam date, and choose a difficulty from one to five. Add checkboxes for the units, all ticked by default. Add a button called Add Subject. Show each added subject as a card with its name, exam date, difficulty and number of units, and a delete button on every card.

5. Role. You are the planning engine of ExamPilot. Context. Each subject card has an exam date, a difficulty from one to five, and a set of ticked units. Task. Add a button called Generate Plan. Every ticked unit becomes one study task. Spread the tasks across the days from today to the exam date. Harder subjects are scheduled earlier. Reserve the last two days before each exam for revision tasks. Show the plan grouped by date. Example. Deep Learning with five units, difficulty four and an exam in ten days gets units one to three first, then units four and five, then two revision days. Important. Never schedule more than four tasks on one day, and never schedule anything after the exam date.

6. Add a feasibility check to Generate Plan. If a subject has more units than can fit before its exam at four tasks per day, do not create a fake plan. Show a clear warning with the minimum number of days needed, and suggest fewer units or a later exam date.

7. Make every task expandable. When opened, it shows that unit's short and long questions, each with its own checkbox. A task turns green with a strikethrough only when all of its questions are ticked.

8. Add a progress bar at the top showing the percentage of all questions completed. Add a readiness percentage on each subject card. Add a Today section at the top showing only today's tasks.

9. On each subject card show the days left until the exam. If fewer than three days remain, make the card red. Add a streak counter that goes up by one for each day I tick at least one question.

10. Save subjects, tasks, ticked questions and streak in local storage, and load them when the page opens, so nothing is lost on refresh.

11. Test the app with an exam date in the past, no subject selected, and no units ticked. Find the bugs and fix them. Show a friendly red error message instead of breaking.

12. Make the design modern and clean with a dark theme and one accent color. Make it fully responsive for phones. Add smooth hover effects on cards and buttons.

13. Write a README with a one line pitch, a features list, how to run it, and a section called Built with my voice, explaining that every line was created using Wispr Flow dictation. Add a note that the questions come from KHIT question banks and the app is for personal study. Leave placeholders at the top for the live link and a Wispr Flow usage screenshot. Also create a git ignore file that excludes the source folder.

14. Create a file called PROMPTS.md that lists, in order, every instruction I have given you in this project, as a numbered list.

15. Give me the exact git commands to commit this project, push it to a new public GitHub repository called ExamPilot, and enable GitHub Pages.
