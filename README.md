# LGD Mapper - Frontend

This is the React frontend for the LGD Mapper application. It provides a user-friendly interface for researchers to upload their datasets, define geographic hierarchies, and map their data to the official Local Government Directory (LGD) codes with AI-powered assistance.

---

## Features

-   **Step-by-Step Workflow:** Guides the user through uploading data, selecting columns, defining the hierarchy, and running the mapping process.
-   **Interactive Explorer:** Displays the mapped data in a hierarchical tree, with color-coded confidence levels to highlight matches that need review.
-   **Detailed Entity View:** Allows users to inspect potential matches, manually confirm a correct match, or clear an incorrect one.
-   **Feedback Mechanism:** Enables users to submit corrections and suggest new name variations, which helps improve the backend AI model over time.
-   **Modern Tech Stack:** Built with React, TypeScript, Vite, and TailwindCSS for a fast and maintainable user experience.

---

## 🚀 Setup (Development)

Follow these steps to set up and run the frontend locally for development.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### 1. Install Dependencies

Clone the repository and install the required npm packages.

```bash
# Using npm
npm install

# Or using pnpm
pnpm install