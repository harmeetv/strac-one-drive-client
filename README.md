# Strac-One-Drive

Strac-One-Drive is a modern web application designed to enhance file management and operations, leveraging the power of Microsoft's OneDrive API. Built with React and optimized for performance, this project aims to provide a seamless and efficient user experience for managing files in the cloud.

## Features

- **File Browsing**: Easily navigate through your OneDrive files and folders.
- **File Operations**: Download files directly from the interface.
- **Real-time User Access Updates**: Stay informed about who has access to your files with real-time updates. See changes in user permissions and track collaboration in real-time, ensuring secure and efficient file management.

## Getting Started

Follow these steps to set up a local copy of the project.

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Microsoft Azure account
- Registered Azure application

For instructions on how to register an Azure application, please refer to the official Microsoft documentation:
https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app?tabs=certificate

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/harmeetv/strac-one-drive-client.git
2. Navigate to the project directory:
   ```sh
   cd strac-one-drive-client
3. Install dependencies:
   ```sh
   npm install
4. Set up environment variables: Create a .env file in the root directory and add your OneDrive API credentials:
   ```sh
   REACT_APP_ONEDRIVE_CLIENT_ID=your_client_id
   REACT_APP_ONEDRIVE_REDIRECT_URI=your_redirect_uri
5. To start the development server:
   ```
   npm run dev

Open your browser and navigate to http://localhost:3000 to access the application.

### Contributing

We welcome contributions to Strac-One-Drive! If you have suggestions for improvements or encounter any issues, please feel free to open an issue or submit a pull request.

### License
This project is licensed under the MIT License. See the LICENSE file for details.

### Contact

For any questions or support, please contact:
Your Name - hrmtsngh18@gmail.com
Project Link: https://github.com/harmeetv/strac-one-drive-client
