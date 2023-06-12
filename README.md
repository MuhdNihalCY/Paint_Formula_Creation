# MegaPaints Web App

This repository contains the source code for the MegaPaints web application. Follow the instructions below to set up and run the application.

## Prerequisites

Before starting, ensure you have the following prerequisites installed on your system:

1. [Node.js](https://nodejs.org/en/) (LTS version)
2. [Docker](https://www.docker.com/get-started)

## Getting Started

1. Download and install the LTS version of Node.js from the official website: [https://nodejs.org/en/](https://nodejs.org/en/)

2. Download and install Docker from the official website: [https://www.docker.com/get-started](https://www.docker.com/get-started)

3. Clone the source code repository by running the following command in your terminal or command prompt:

   ```bash
   git clone [<repository-url>](https://github.com/MuhdNihalCY/Paint_Formula_Creation.git)
   ```

4. Navigate to the cloned repository:

   ```bash
   cd Paint_Formula_Creation
   ```

5. Build the Docker image for the MegaPaints web app using the following command:

   ```bash
   docker build -t megaPaints .
   ```

6. Run the Docker container with the following command:

   ```bash
   docker run -p 3000:3000 megaPaints
   ```

7. Once the container is running, you can access the MegaPaints web app by opening your web browser and navigating to [http://localhost:3000](http://localhost:3000).

   The web app will now be running on port 3000, and you can interact with it through the browser.

## License

This project is licensed under the [MIT License](LICENSE).
