# Sarvham Foundation Webs

Welcome to the **Sarvham Foundation** web application. This repository contains the source code for the organization's official website, built with Express, MongoDB, and modern web aesthetics.

## Features
- **Express-based Backend**: Handles contact requests, volunteer registrations, stats, and gallery management.
- **MongoDB Integration**: Store and query statistics, gallery assets, volunteer lists, and contact submissions.
- **Admin Panel**: Secure dashboard to manage applications and site assets.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a cloud URI)

### Installation
1. Clone the repository and navigate to the directory:
   ```bash
   cd sarvham-foundation
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environmental variables in a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=sarvhamadmin
   ```
4. Start the application:
   ```bash
   npm start
   ```
   Open `http://localhost:5000` in your browser.
