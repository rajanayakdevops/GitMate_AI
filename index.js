const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config(); // Load API key from .env file

const API_KEY = process.env.GEMINI_API_KEY; // Store API key securely
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Function to generate a commit message using the Gemini API
async function generateCommitMessageAI(diffContent) {
  try {
    // Construct the request payload
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Generate a concise and meaningful Git commit message for the following changes:\n${diffContent}`,
            },
          ],
        },
      ],
    };

    // Send the request to Gemini API
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Extract commit message from response
    const commitMessage = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Generated commit message not found';

    return commitMessage;
  } catch (error) {
    console.error('Error generating commit message:', error.response?.data || error.message);
    return 'Error generating commit message';
  }
}

// Main function
async function main() {
  try {
    // Get the Git diff for staged changes
    const diffContent = execSync('git diff --staged').toString().trim();

    // Check if there are staged changes before proceeding
    if (!diffContent) {
      console.log('No staged changes detected.');
      return;
    }

    console.log('Generating commit message...');
    
    // Generate commit message using Gemini API
    const commitMessage = await generateCommitMessageAI(diffContent);

    // Output the generated commit message
    console.log('Suggested Commit Message:', commitMessage);
    
    // Uncomment below to auto-commit (optional)
    // execSync(`git commit -m "${commitMessage}"`);

  } catch (error) {
    console.error('Error in generating commit message:', error);
  }
}

// Execute main function
main();
