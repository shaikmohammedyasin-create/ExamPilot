# ExamPilot - Voice Prompts Log

Every prompt below was dictated using **Wispr Flow** to build ExamPilot iteratively from start to finish.

1. Check data.js for each subject. Tell me how many units, short questions, and long questions it has, and point out any unit that looks empty or wrong. Fix any problems by reading the source files again.
2. Add a form where IPK subject is from a dropdown built from data.js. Choose an exam date and a difficulty from 1 to 5. Add checkboxes for the units, all ticked by default. Add a button called "Add Subject". Show each added subject as a card with its name, exam date, difficulty, and number of units, and a delete button on every card.
3. Goal: Your planning engine of ExamPilot. Context: Each subject card has an exam date, a difficulty from 1 to 5, and a set of ticket units.  
   Task:  
   - Add a button called "Generate Plan".  
   - Every ticket unit becomes one steady task.  
   - Spread the task across the days from today to the exam date.  
   - Harder subjects are shifted earlier.  
   - Reserve the last 2 days before each exam for revision tasks.  
   - Show the plan grouped by date.  
   - Example: Deep learning with 5 units, difficulty 4, and an exam in 10 days. Get units 1, 2, and 3 first, then units 4 and 5, then 2 revision days.  
   Important:  
   - Never schedule more than 4 tasks on one day.  
   - Never schedule anything after the exam date.
4. Add a feasibility check to generate a plan. If a subject has more units than can fit before its exam at 4 tasks per day, do not create a fake plan. Show a clear warning with the minimum number of days needed and suggest fewer units or a later exam date.
5. Make every task expandable. When opened, it shows that units, short and long questions, each with its own checkbox. A task turns green with a strikethrough only when all of its questions are ticked.
6. - Add a progress bar at the top showing the percentage of all questions completed.  
   - Add a readiness percentage on each subject card.  
   - Add a Today section at the top showing only today's task.
7. On each subject card, show the days left until the exam. If fewer than 3 days remain, make a card red. Add a streak counter that goes up by 1 for each day I tick at least one question.
8. Save subjects, tasks, ticket questions, and streak in local storage and load them when the page opens, so nothing is lost on refresh.
9. Test the app with an exam date in the past, no subject selected, and no unit ticked. Find the bugs and fix them. Show a friendly red error message instead of breaking.
10. Make the design modern and clean with a dark theme and one accent color. Make it fully responsive for phones. Add smooth hover effects on the cards and buttons.
11. Write a README with:  
    - a one-line pitch  
    - a features list  
    - how to run it  
    - a section called "Built with My Voice" explaining that every line was created using Wispr Flow dictation  
    Add a note that the questions come from KHT question banks and the app is for personal study. Leave placeholders at the top for the live link and a Wispr Flow usage screenshot. Also create a .gitignore file that excludes the source folder.
12. Create a file called prompts.md that lists, in order, every instruction I have given you in this project as a numbered list.
