# Deployment Guide

This guide explains how to deploy the 5th Grade Homework Helper application on GitHub and Replit.

## GitHub Deployment

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "homework-helper")
4. Choose whether to make it public or private
5. Click "Create repository"

### Step 2: Push Your Code to GitHub

From your local project directory, run the following commands:

```bash
# Initialize a git repository if you haven't already
git init

# Add all files to staging
git add .

# Commit your changes
git commit -m "Initial commit"

# Add your GitHub repository as a remote
git remote add origin https://github.com/your-username/homework-helper.git

# Push your code to GitHub
git push -u origin main
```

Replace `your-username` with your actual GitHub username and `homework-helper` with your repository name.

## Replit Deployment

### Step 1: Create a New Replit Project

1. Go to [Replit](https://replit.com/) and sign in to your account
2. Click the "+ Create" button
3. Select "Import from GitHub"
4. Enter your GitHub repository URL (e.g., `https://github.com/your-username/homework-helper.git`)
5. Click "Import from GitHub"

### Step 2: Configure Environment Variables

1. In your Replit project, click on the padlock icon (🔒) in the left sidebar to open the "Secrets" panel
2. Add the following secrets:
   - Key: `OPENAI_API_KEY`, Value: your OpenAI API key

### Step 3: Run Your Application

1. In Replit, click the "Run" button at the top of the screen
2. Replit will automatically install the dependencies and start your server
3. Your application will be available at the URL shown in the Webview panel (usually something like `https://homework-helper.your-username.repl.co`)

### Step 4: Configure Always-On (Optional)

For education deployments, you may want your Replit to stay online even when not actively being used:

1. Upgrade to Replit's paid plan
2. In your project, go to the "Deployment" tab
3. Toggle "Always On" to enable it

## Deploying the Arduino Bridge

The Arduino bridge code needs to run locally on the school computer, as it communicates with the Arduino hardware connected via USB.

Instructions for setting up the Arduino bridge are in the main README.md file.

## Testing Your Deployment

1. Visit your Replit URL in a web browser
2. You should see the activation screen
3. Enter one of the valid activation codes (e.g., `SCHOOL2023`)
4. Once activated, the main application interface should appear
5. If you have the Arduino hardware connected, run the Arduino bridge locally to enable the physical button functionality

## Troubleshooting

### Replit Issues

- **Dependency Installation Fails**: If dependencies fail to install, try manually running `npm install` in the Replit shell
- **API Key Not Working**: Check that you've correctly added the OPENAI_API_KEY to your Replit secrets
- **Connection Errors**: Make sure your Replit is running and not stopped due to inactivity

### Arduino Bridge Issues

- **Arduino Not Detected**: Make sure the Arduino is properly connected and that the correct port is specified in the bridge code
- **Bridge Connection Failed**: Ensure the bridge server is running and accessible from the web application 