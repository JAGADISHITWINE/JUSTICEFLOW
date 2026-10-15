pipeline {
    agent any

    options {
        // Stop execution if any build takes longer than 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Retain only the last 10 builds to conserve Jenkins disk space
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Prevent simultaneous overlapping builds of the same branch
        disableConcurrentBuilds()
        // Print human-readable timestamps in the console output
        timestamps()
    }

    tools {
        // Matches the NodeJS tool configured in: Manage Jenkins -> Tools -> NodeJS Installations
        nodejs 'node20'
    }

    environment {
        CI = 'true'
        NODE_ENV = 'production'
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo '=== Step 1: Checking out repository code from Git ==='
                checkout scm
                script {
                    if (isUnix()) {
                        sh 'node --version'
                        sh 'npm --version'
                    } else {
                        bat 'node --version'
                        bat 'npm --version'
                    }
                }
            }
        }

        stage('2. Install Backend Dependencies') {
            steps {
                echo '=== Step 2: Installing Backend Microservice Dependencies ==='
                dir('backend') {
                    script {
                        if (isUnix()) {
                            sh 'npm install --legacy-peer-deps'
                        } else {
                            bat 'npm install --legacy-peer-deps'
                        }
                    }
                }
            }
        }

        stage('3. Backend Syntax Validation') {
            steps {
                echo '=== Step 3: Validating JavaScript syntax for all 8 Backend Microservices ==='
                dir('backend') {
                    script {
                        def services = [
                            'api-gateway/server.js',
                            'auth-service/server.js',
                            'client-service/server.js',
                            'case-service/server.js',
                            'documents-service/server.js',
                            'time-tracking-service/server.js',
                            'billing-service/server.js',
                            'calendar-service/server.js'
                        ]
                        for (service in services) {
                            echo "Checking: ${service}"
                            if (isUnix()) {
                                sh "node -c ${service}"
                            } else {
                                bat "node -c ${service}"
                            }
                        }
                    }
                }
            }
        }

        stage('4. Install Frontend Dependencies') {
            steps {
                echo '=== Step 4: Installing Angular Frontend Dependencies ==='
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm install --legacy-peer-deps'
                        } else {
                            bat 'npm install --legacy-peer-deps'
                        }
                    }
                }
            }
        }

        stage('5. Build Frontend') {
            steps {
                echo '=== Step 5: Compiling Angular Frontend Production Bundle ==='
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm run build'
                        } else {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('6. Archive Artifacts') {
            steps {
                echo '=== Step 6: Archiving Compiled Angular Build (dist/) ==='
                archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: false, fingerprint: true
            }
        }
    }

    post {
        success {
            echo '====================================================='
            echo ' [SUCCESS] JusticeFlow CI Pipeline completed cleanly!'
            echo " Build #${env.BUILD_NUMBER} passed all validation checks."
            echo '====================================================='
        }
        failure {
            echo '====================================================='
            echo ' [FAILED] JusticeFlow CI Pipeline build failed!'
            echo ' Please inspect the stage logs above for error details.'
            echo '====================================================='
        }
        always {
            echo "Pipeline run completed at: ${new Date().toString()}"
        }
    }
}
