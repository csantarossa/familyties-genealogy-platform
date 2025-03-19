# FamilyTies: Genealogy Project

## To Download

1. Make a directory in a designated folder for your projects (e.g. `/software-projects`)
2. Open the terminal and navigate to the directory.
3. Enter `git clone https://github.com/csantarossa/familyties-genealogy-platform.git` in the terminal.
4. Navigate inside `familyties-genealogy-platform` and type `npm install` to download all the packages.
5. Make a `.env` file in the **root folder**. _Make sure you add this to the `.gitignore` so it doesn't get uploaded to GitHub._
6. Copy and paste `DATABASE_URL=<ask someone for database string>` into your .env file

Type `npm run dev`, and checkout these URLs to make sure its all good:
http://localhost:3000/login
http://localhost:3000/signup

---

## Version Control Process

1. `git branch <name your branch something relevant>`
2. `git branch` (make sure you are in the right branch - `git checkout <branch-name>` to swap branches if not in the new one)
3. `git pull --rebase origin main` to get the latest updates 
4. As you progress, make sure you `git add .` and `git commit -m "description here"` to save updates. This is useful if you mess things up so much you need to just go back to a commit when everything worked fine and start again.
5. When you are ready to make a Pull Request (PR), `git push origin <branch name>` then go to GitHub and it will prompt you to submit a PR. Follow the steps and get it submitted for review.

Once reviewed it will either be merged to main, or you will need to clean things up so that there are no conflicts.

---

###### END
