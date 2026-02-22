# MongoDB Compass Import Guide

## Step 1: Download MongoDB Compass
1. Go to: https://mongodb.com/products/compass
2. Download for Windows
3. Install Compass

## Step 2: Connect to Atlas
1. Open MongoDB Compass
2. Paste this connection string:
   ```
   mongodb+srv://oogysama:Aswin%402003@echoaiddb.pudtwgb.mongodb.net/echoaid
   ```
3. Click "Connect"

## Step 3: Import Data
1. Right-click on database "echoaid"
2. Choose "Import Data"
3. Select JSON files from: D:\echoaid\backend\data-export\
4. Import each collection one by one

## Collections to Import:
- achievements.json → achievements
- categories.json → categories
- skills.json → skills
- signs.json → signs
- users.json → users
- userachievements.json → userachievements
- usersessions.json → usersessions
- userskillprogresses.json → userskillprogresses
- practiceattempts.json → practiceattempts
- quizattempts.json → quizattempts
- quizzes.json → quizzes
- messages.json → messages
- practicelaters.json → practicelaters

## Step 4: Verify Import
1. Check each collection has data
2. Verify user accounts can log in
3. Test the connection from your app