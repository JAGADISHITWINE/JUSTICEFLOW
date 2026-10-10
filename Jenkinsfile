pipeline {
    agent any

    tools {
        nodejs 'node20' // Configured under Manage Jenkins -> Tools -> NodeJS
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }

        stage('2. Install Backend Dependencies') {
            steps {
                echo 'Installing Backend packages...'
                dir('backend') {
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('3. Install & Build Frontend') {
            steps {
                echo 'Installing Frontend packages & building Angular...'
                dir('frontend') {
                    sh 'npm install --legacy-peer-deps'
                    sh 'npm run build'
                }
            }
        }

        stage('4. Code Validation') {
            steps {
                echo 'Validating JusticeFlow Microservices syntax...'
                dir('backend') {
                    sh 'node -c api-gateway/server.js'
                    sh 'node -c auth-service/server.js'
                    sh 'node -c case-service/server.js'
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: JusticeFlow CI Build passed cleanly!'
        }
        failure {
            echo 'FAILED: JusticeFlow CI Build failed. Check the console log!'
        }
    }
}
