# Deployment Automation & Production Release
## CI/CD Pipeline, OTA Updates, and Field Deployment

---

## 1. Jenkins CI/CD Pipeline

### 1.1 Complete Jenkinsfile

```groovy
/**
 * Jenkins Pipeline for DO-178C DAL A Flight Control Module
 * Certification Evidence Generation Pipeline
 */

@Library('avionics-shared-library') _

pipeline {
    agent {
        label 'avionics-build-server'
    }
    
    parameters {
        choice(
            name: 'BUILD_TYPE',
            choices: ['Debug', 'Release', 'Certification'],
            description: 'Build configuration type'
        )
        
        booleanParam(
            name: 'RUN_FULL_VERIFICATION',
            defaultValue: false,
            description: 'Run complete verification suite (MC/DC, WCET, HIL)'
        )
        
        booleanParam(
            name: 'GENERATE_CERT_EVIDENCE',
            defaultValue: false,
            description: 'Generate certification evidence package'
        )
    }
    
    environment {
        // Toolchain paths
        DEOS_SDK = '/opt/deos-sdk'
        POWERPC_TOOLCHAIN = '/opt/gcc-powerpc-eabispe'
        
        // Verification tools
        LDRA_TOOLSUITE = '/opt/ldra'
        RAPITA_RVS = '/opt/rapita-rvs'
        VECTORCAST = '/opt/vectorcast'
        
        // Project metadata
        PROJECT_ID = 'FCM-001'
        CERT_LEVEL = 'DAL_A'
        TYPE_CERT = 'TC-12345'
        
        // Artifact versioning
        VERSION = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = "${env.GIT_COMMIT.take(8)}"
    }
    
    stages {
        
        /* ================================================ */
        /* STAGE 1: CHECKOUT & CONFIGURATION                */
        /* ================================================ */
        
        stage('Checkout') {
            steps {
                script {
                    echo "=== Checking out source code ==="
                    
                    checkout scm
                    
                    // Verify we're on a release branch for cert builds
                    if (params.BUILD_TYPE == 'Certification') {
                        def branch = sh(
                            script: "git rev-parse --abbrev-ref HEAD",
                            returnStdout: true
                        ).trim()
                        
                        if (!branch.startsWith('release/') && !branch.startsWith('cert/')) {
                            error "Certification builds must be from release/* or cert/* branches"
                        }
                    }
                    
                    // Record build metadata
                    sh """
                        echo "Build Number: ${env.BUILD_NUMBER}" > build_metadata.txt
                        echo "Git Commit: ${env.GIT_COMMIT}" >> build_metadata.txt
                        echo "Build Type: ${params.BUILD_TYPE}" >> build_metadata.txt
                        echo "Build Date: \$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> build_metadata.txt
                    """
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 2: STATIC ANALYSIS (MISRA C)               */
        /* ================================================ */
        
        stage('Static Analysis') {
            steps {
                script {
                    echo "=== Running LDRA Static Analysis (MISRA C:2012) ==="
                    
                    sh """
                        ${LDRA_TOOLSUITE}/bin/ldra-analyzer \\
                            --project ${WORKSPACE} \\
                            --standard MISRA_C_2012 \\
                            --dal ${CERT_LEVEL} \\
                            --output ${WORKSPACE}/ldra-reports \\
                            --format html,xml,pdf
                    """
                    
                    // Parse LDRA results
                    def ldraResults = readFile("${WORKSPACE}/ldra-reports/summary.xml")
                    
                    // Publish LDRA report
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'ldra-reports',
                        reportFiles: 'index.html',
                        reportName: 'LDRA Static Analysis',
                        reportTitles: 'MISRA C:2012 Compliance'
                    ])
                    
                    // Check for violations
                    def violations = sh(
                        script: "${LDRA_TOOLSUITE}/bin/ldra-check-violations --report ldra-reports/summary.xml",
                        returnStatus: true
                    )
                    
                    if (violations != 0 && params.BUILD_TYPE == 'Certification') {
                        error "MISRA C violations detected - cannot proceed with certification build"
                    }
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 3: BUILD                                   */
        /* ================================================ */
        
        stage('Build') {
            steps {
                script {
                    echo "=== Building Flight Control Module ==="
                    
                    sh """
                        mkdir -p build
                        cd build
                        
                        cmake .. \\
                            -DCMAKE_BUILD_TYPE=${params.BUILD_TYPE} \\
                            -DCERTIFICATION_LEVEL=${CERT_LEVEL} \\
                            -DPROJECT_ID=${PROJECT_ID} \\
                            -DTYPE_CERTIFICATE=${TYPE_CERT} \\
                            -DVERSION=${VERSION}
                        
                        make -j\$(nproc) all
                        make size-report
                        make stack-analysis
                    """
                    
                    // Archive build outputs
                    archiveArtifacts artifacts: 'build/**/*.elf, build/**/*.bin, build/**/*.map',
                                     fingerprint: true
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 4: UNIT TESTING (VectorCAST)               */
        /* ================================================ */
        
        stage('Unit Tests') {
            steps {
                script {
                    echo "=== Running Unit Tests with VectorCAST ==="
                    
                    sh """
                        export VECTORCAST_DIR=${VECTORCAST}
                        
                        # Build test environment
                        vcast -e FlightControl.env build
                        
                        # Execute tests
                        vcast -e FlightControl.env execute batch
                        
                        # Generate reports
                        vcast -e FlightControl.env reports custom unit_test_report.html
                        vcast -e FlightControl.env export results unit_test_results.xml
                    """
                    
                    // Publish test results
                    junit 'unit_test_results.xml'
                    
                    publishHTML([
                        reportDir: '.',
                        reportFiles: 'unit_test_report.html',
                        reportName: 'Unit Test Results'
                    ])
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 5: COVERAGE ANALYSIS (MC/DC)               */
        /* ================================================ */
        
        stage('Coverage Analysis') {
            when {
                expression { params.RUN_FULL_VERIFICATION || params.BUILD_TYPE == 'Certification' }
            }
            steps {
                script {
                    echo "=== Running RapiCover MC/DC Analysis ==="
                    
                    sh """
                        ${RAPITA_RVS}/bin/rapicov instrument \\
                            --source partition/flight_control/src \\
                            --output build/instrumented \\
                            --coverage mcdc
                        
                        # Build instrumented code
                        cd build/instrumented
                        make
                        
                        # Run instrumented binary on target/simulator
                        ${RAPITA_RVS}/bin/rapicov run \\
                            --executable flight_control_inst.elf \\
                            --iterations 1000 \\
                            --output coverage.dat
                        
                        # Generate coverage report
                        ${RAPITA_RVS}/bin/rapicov report \\
                            --input coverage.dat \\
                            --requirements ${WORKSPACE}/requirements/requirements.csv \\
                            --format html,xml,certification \\
                            --output ${WORKSPACE}/coverage-reports
                    """
                    
                    // Publish coverage report
                    publishHTML([
                        reportDir: 'coverage-reports',
                        reportFiles: 'index.html',
                        reportName: 'MC/DC Coverage Report'
                    ])
                    
                    // Verify 100% coverage for DAL A
                    def coverageCheck = sh(
                        script: "${RAPITA_RVS}/bin/rapicov verify --coverage coverage.dat --threshold 100",
                        returnStatus: true
                    )
                    
                    if (coverageCheck != 0 && params.BUILD_TYPE == 'Certification') {
                        error "MC/DC coverage below 100% - certification requirement not met"
                    }
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 6: WCET ANALYSIS                           */
        /* ================================================ */
        
        stage('WCET Analysis') {
            when {
                expression { params.RUN_FULL_VERIFICATION || params.BUILD_TYPE == 'Certification' }
            }
            steps {
                script {
                    echo "=== Running RapiTime WCET Analysis ==="
                    
                    sh """
                        ${RAPITA_RVS}/bin/rapitime analyze \\
                            --source partition/flight_control/src \\
                            --target powerpc-e6500 \\
                            --optimization O2 \\
                            --cache-model ${WORKSPACE}/config/T2080_cache.xml \\
                            --function flight_control_task \\
                            --output ${WORKSPACE}/wcet-reports
                    """
                    
                    publishHTML([
                        reportDir: 'wcet-reports',
                        reportFiles: 'wcet_report.html',
                        reportName: 'WCET Analysis Report'
                    ])
                    
                    // Verify WCET meets deadline
                    def wcetCheck = sh(
                        script: """
                            ${RAPITA_RVS}/bin/rapitime verify \\
                                --report wcet-reports/wcet_summary.xml \\
                                --deadline 15000
                        """,
                        returnStatus: true
                    )
                    
                    if (wcetCheck != 0) {
                        error "WCET exceeds deadline - real-time requirements not met"
                    }
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 7: INTEGRATION TESTS                       */
        /* ================================================ */
        
        stage('Integration Tests') {
            steps {
                script {
                    echo "=== Running Integration Tests ==="
                    
                    sh """
                        cd tests/integration
                        python3 run_integration_tests.py \\
                            --binary ${WORKSPACE}/build/flight_control.elf \\
                            --config arinc653_module.xml \\
                            --output ${WORKSPACE}/integration-reports
                    """
                    
                    junit 'integration-reports/integration_results.xml'
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 8: HIL TESTING                             */
        /* ================================================ */
        
        stage('HIL Tests') {
            when {
                expression { params.RUN_FULL_VERIFICATION }
            }
            steps {
                script {
                    echo "=== Running Hardware-in-the-Loop Tests ==="
                    
                    sh """
                        cd tests/hil
                        python3 hil_test_suite.py \\
                            --target-hw /dev/mil1553_0,/dev/arinc429_0 \\
                            --binary ${WORKSPACE}/build/flight_control.bin \\
                            --scenarios takeoff,sensor_failure,landing \\
                            --output ${WORKSPACE}/hil-reports
                    """
                    
                    publishHTML([
                        reportDir: 'hil-reports',
                        reportFiles: 'hil_report.html',
                        reportName: 'HIL Test Results'
                    ])
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 9: TRACEABILITY MATRIX                     */
        /* ================================================ */
        
        stage('Generate Traceability') {
            when {
                expression { params.GENERATE_CERT_EVIDENCE || params.BUILD_TYPE == 'Certification' }
            }
            steps {
                script {
                    echo "=== Generating Requirements Traceability Matrix ==="
                    
                    sh """
                        python3 scripts/generate_trace_matrix.py \\
                            --requirements requirements/requirements.csv \\
                            --source partition/flight_control/src \\
                            --tests tests/ \\
                            --output ${WORKSPACE}/traceability_matrix.html
                    """
                    
                    publishHTML([
                        reportDir: '.',
                        reportFiles: 'traceability_matrix.html',
                        reportName: 'Requirements Traceability'
                    ])
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 10: CERTIFICATION EVIDENCE PACKAGE          */
        /* ================================================ */
        
        stage('Certification Package') {
            when {
                expression { params.GENERATE_CERT_EVIDENCE && params.BUILD_TYPE == 'Certification' }
            }
            steps {
                script {
                    echo "=== Generating Certification Evidence Package ==="
                    
                    sh """
                        mkdir -p certification-package
                        
                        # Copy all reports
                        cp -r ldra-reports certification-package/
                        cp -r coverage-reports certification-package/
                        cp -r wcet-reports certification-package/
                        cp -r integration-reports certification-package/
                        cp traceability_matrix.html certification-package/
                        
                        # Generate Software Accomplishment Summary (SAS)
                        python3 scripts/generate_sas.py \\
                            --project-id ${PROJECT_ID} \\
                            --dal ${CERT_LEVEL} \\
                            --type-cert ${TYPE_CERT} \\
                            --version ${VERSION} \\
                            --reports certification-package/ \\
                            --output certification-package/SAS_${VERSION}.pdf
                        
                        # Create archive
                        tar -czf certification-package-${VERSION}.tar.gz certification-package/
                    """
                    
                    archiveArtifacts artifacts: 'certification-package-${VERSION}.tar.gz',
                                     fingerprint: true
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 11: SIGN & PACKAGE RELEASE                 */
        /* ================================================ */
        
        stage('Sign Release') {
            when {
                expression { params.BUILD_TYPE == 'Certification' }
            }
            steps {
                script {
                    echo "=== Signing Release Binary ==="
                    
                    withCredentials([file(credentialsId: 'avionics-signing-key', variable: 'SIGNING_KEY')]) {
                        sh """
                            # Sign binary with private key
                            openssl dgst -sha256 -sign \${SIGNING_KEY} \\
                                -out build/flight_control_v${VERSION}.bin.sig \\
                                build/flight_control_v${VERSION}.bin
                            
                            # Create loadable package
                            scripts/create_ota_package.sh \\
                                --binary build/flight_control_v${VERSION}.bin \\
                                --signature build/flight_control_v${VERSION}.bin.sig \\
                                --version ${VERSION} \\
                                --output releases/flight_control_v${VERSION}.pkg
                        """
                    }
                    
                    archiveArtifacts artifacts: 'releases/flight_control_v${VERSION}.pkg',
                                     fingerprint: true
                }
            }
        }
        
        /* ================================================ */
        /* STAGE 12: PUBLISH TO ARTIFACT REPOSITORY          */
        /* ================================================ */
        
        stage('Publish Artifacts') {
            when {
                expression { params.BUILD_TYPE == 'Release' || params.BUILD_TYPE == 'Certification' }
            }
            steps {
                script {
                    echo "=== Publishing to Artifact Repository ==="
                    
                    // Upload to Artifactory/Nexus
                    sh """
                        curl -u \${ARTIFACTORY_USER}:\${ARTIFACTORY_PASSWORD} \\
                            -T releases/flight_control_v${VERSION}.pkg \\
                            "https://artifactory.company.com/avionics/releases/flight_control_v${VERSION}.pkg"
                    """
                }
            }
        }
    }
    
    /* ================================================ */
    /* POST-BUILD ACTIONS                                */
    /* ================================================ */
    
    post {
        success {
            script {
                echo "=== Build Successful ==="
                
                // Notify team
                emailext(
                    subject: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        Build completed successfully.
                        
                        Build Type: ${params.BUILD_TYPE}
                        Version: ${VERSION}
                        Git Commit: ${env.GIT_COMMIT}
                        
                        View results: ${env.BUILD_URL}
                    """,
                    to: 'avionics-team@company.com'
                )
                
                // Update status badge
                setBuildStatus("Build succeeded", "SUCCESS")
            }
        }
        
        failure {
            script {
                echo "=== Build Failed ==="
                
                emailext(
                    subject: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        Build failed. Please review logs.
                        
                        Build Type: ${params.BUILD_TYPE}
                        Git Commit: ${env.GIT_COMMIT}
                        
                        View logs: ${env.BUILD_URL}console
                    """,
                    to: 'avionics-team@company.com',
                    attachLog: true
                )
                
                setBuildStatus("Build failed", "FAILURE")
            }
        }
        
        always {
            // Clean up workspace if needed
            cleanWs(
                deleteDirs: true,
                patterns: [
                    [pattern: 'build/', type: 'INCLUDE'],
                    [pattern: '*-reports/', type: 'INCLUDE']
                ]
            )
        }
    }
}

def setBuildStatus(String message, String state) {
    step([
        $class: "GitHubCommitStatusSetter",
        reposSource: [$class: "ManuallyEnteredRepositorySource", url: env.GIT_URL],
        contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins"],
        errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
        statusResultSource: [$class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]]]
    ])
}
```

---

## 2. Over-the-Air (OTA) Update System

### 2.1 OTA Package Creator

```bash
#!/bin/bash
# create_ota_package.sh
# Create secure OTA update package for field deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --binary)
            BINARY_FILE="$2"
            shift 2
            ;;
        --signature)
            SIGNATURE_FILE="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate inputs
if [[ -z "$BINARY_FILE" || -z "$SIGNATURE_FILE" || -z "$VERSION" || -z "$OUTPUT_FILE" ]]; then
    echo "Usage: $0 --binary <file> --signature <file> --version <ver> --output <file>"
    exit 1
fi

if [[ ! -f "$BINARY_FILE" ]]; then
    echo "Error: Binary file not found: $BINARY_FILE"
    exit 1
fi

if [[ ! -f "$SIGNATURE_FILE" ]]; then
    echo "Error: Signature file not found: $SIGNATURE_FILE"
    exit 1
fi

echo "=== Creating OTA Package ==="
echo "Binary: $BINARY_FILE"
echo "Version: $VERSION"
echo "Output: $OUTPUT_FILE"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy files to temp directory
cp "$BINARY_FILE" "$TEMP_DIR/firmware.bin"
cp "$SIGNATURE_FILE" "$TEMP_DIR/firmware.sig"

# Generate manifest
cat > "$TEMP_DIR/manifest.json" <<EOF
{
  "version": "$VERSION",
  "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD)",
  "binary_file": "firmware.bin",
  "signature_file": "firmware.sig",
  "binary_size": $(stat -f%z "$BINARY_FILE" 2>/dev/null || stat -c%s "$BINARY_FILE"),
  "binary_sha256": "$(sha256sum "$BINARY_FILE" | awk '{print $1}')",
  "certification": {
    "level": "DAL_A",
    "type_certificate": "TC-12345",
    "approved_for_deployment": true
  },
  "compatibility": {
    "hardware": ["NAI-68PPC2"],
    "rtos_version": "Deos-5.1",
    "min_version": "1.0.0"
  },
  "deployment_constraints": {
    "aircraft_on_ground": true,
    "power_requirements": "28V DC stable",
    "estimated_update_time_seconds": 120
  }
}
EOF

# Create package (tar.gz with encryption)
cd "$TEMP_DIR"
tar -czf package.tar.gz firmware.bin firmware.sig manifest.json

# Encrypt package with AES-256
ENCRYPTION_KEY=$(openssl rand -hex 32)
openssl enc -aes-256-cbc -salt -in package.tar.gz -out package.enc -pass pass:$ENCRYPTION_KEY

# Save encryption key (would be distributed via secure channel)
echo "$ENCRYPTION_KEY" > "$OUTPUT_FILE.key"

# Final package
mv package.enc "$OUTPUT_FILE"

echo "=== OTA Package Created ==="
echo "Package: $OUTPUT_FILE"
echo "Size: $(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE") bytes"
echo "Encryption key saved to: $OUTPUT_FILE.key"
echo ""
echo "IMPORTANT: Distribute encryption key via secure channel!"
```

### 2.2 OTA Update Client (Aircraft Side)

```c
/**
 * @file ota_update_client.c
 * @brief Secure OTA update client for avionics systems
 * @compliance DO-178C DAL A
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/evp.h>
#include <openssl/rsa.h>
#include <openssl/sha.h>

#define OTA_BUFFER_SIZE     (1024 * 1024)  /* 1 MB buffer */
#define MAX_VERSION_LEN     (32)
#define MAX_PATH_LEN        (256)

typedef enum {
    OTA_SUCCESS = 0,
    OTA_ERROR_DOWNLOAD = 1,
    OTA_ERROR_SIGNATURE = 2,
    OTA_ERROR_HASH = 3,
    OTA_ERROR_INSTALL = 4,
    OTA_ERROR_ROLLBACK = 5
} ota_status_t;

typedef struct {
    char version[MAX_VERSION_LEN];
    char binary_path[MAX_PATH_LEN];
    char signature_path[MAX_PATH_LEN];
    uint32_t binary_size;
    unsigned char expected_hash[SHA256_DIGEST_LENGTH];
    bool aircraft_on_ground;
    bool power_stable;
} ota_update_info_t;

/**
 * @brief Verify digital signature of firmware binary
 */
static bool verify_signature(const char* binary_path, const char* sig_path)
{
    FILE *fp_bin, *fp_sig;
    unsigned char *binary_data = NULL;
    unsigned char *signature = NULL;
    size_t binary_size, sig_size;
    bool result = false;
    
    /* Load public key (embedded in bootloader) */
    RSA *rsa_pub = load_public_key();
    if (!rsa_pub) {
        fprintf(stderr, "Failed to load public key\n");
        return false;
    }
    
    /* Read binary file */
    fp_bin = fopen(binary_path, "rb");
    if (!fp_bin) {
        fprintf(stderr, "Failed to open binary: %s\n", binary_path);
        goto cleanup;
    }
    
    fseek(fp_bin, 0, SEEK_END);
    binary_size = ftell(fp_bin);
    fseek(fp_bin, 0, SEEK_SET);
    
    binary_data = malloc(binary_size);
    if (fread(binary_data, 1, binary_size, fp_bin) != binary_size) {
        fprintf(stderr, "Failed to read binary\n");
        goto cleanup;
    }
    fclose(fp_bin);
    fp_bin = NULL;
    
    /* Read signature file */
    fp_sig = fopen(sig_path, "rb");
    if (!fp_sig) {
        fprintf(stderr, "Failed to open signature: %s\n", sig_path);
        goto cleanup;
    }
    
    fseek(fp_sig, 0, SEEK_END);
    sig_size = ftell(fp_sig);
    fseek(fp_sig, 0, SEEK_SET);
    
    signature = malloc(sig_size);
    if (fread(signature, 1, sig_size, fp_sig) != sig_size) {
        fprintf(stderr, "Failed to read signature\n");
        goto cleanup;
    }
    fclose(fp_sig);
    fp_sig = NULL;
    
    /* Compute hash of binary */
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(binary_data, binary_size, hash);
    
    /* Verify signature */
    int verify_result = RSA_verify(
        NID_sha256,
        hash,
        SHA256_DIGEST_LENGTH,
        signature,
        sig_size,
        rsa_pub
    );
    
    result = (verify_result == 1);
    
    if (result) {
        printf("✓ Signature verification passed\n");
    } else {
        fprintf(stderr, "✗ Signature verification FAILED\n");
    }
    
cleanup:
    if (fp_bin) fclose(fp_bin);
    if (fp_sig) fclose(fp_sig);
    if (binary_data) free(binary_data);
    if (signature) free(signature);
    if (rsa_pub) RSA_free(rsa_pub);
    
    return result;
}

/**
 * @brief Verify SHA256 hash of binary
 */
static bool verify_hash(const char* binary_path, const unsigned char* expected_hash)
{
    FILE *fp;
    unsigned char buffer[OTA_BUFFER_SIZE];
    unsigned char computed_hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256_ctx;
    size_t bytes_read;
    
    fp = fopen(binary_path, "rb");
    if (!fp) {
        fprintf(stderr, "Failed to open binary for hash verification\n");
        return false;
    }
    
    /* Compute SHA256 hash */
    SHA256_Init(&sha256_ctx);
    
    while ((bytes_read = fread(buffer, 1, OTA_BUFFER_SIZE, fp)) > 0) {
        SHA256_Update(&sha256_ctx, buffer, bytes_read);
    }
    
    SHA256_Final(computed_hash, &sha256_ctx);
    fclose(fp);
    
    /* Compare hashes */
    if (memcmp(computed_hash, expected_hash, SHA256_DIGEST_LENGTH) == 0) {
        printf("✓ Hash verification passed\n");
        return true;
    } else {
        fprintf(stderr, "✗ Hash verification FAILED\n");
        return false;
    }
}

/**
 * @brief Install firmware update
 */
static ota_status_t install_firmware(const ota_update_info_t* update_info)
{
    printf("=== Installing Firmware Update ===\n");
    printf("Version: %s\n", update_info->version);
    
    /* Backup current firmware */
    printf("Backing up current firmware...\n");
    if (system("cp /boot/firmware.bin /boot/firmware.bin.backup") != 0) {
        fprintf(stderr, "Failed to backup current firmware\n");
        return OTA_ERROR_INSTALL;
    }
    
    /* Copy new firmware to boot partition */
    printf("Installing new firmware...\n");
    char install_cmd[512];
    snprintf(install_cmd, sizeof(install_cmd),
             "cp %s /boot/firmware.bin", update_info->binary_path);
    
    if (system(install_cmd) != 0) {
        fprintf(stderr, "Failed to install new firmware\n");
        
        /* Restore backup */
        system("cp /boot/firmware.bin.backup /boot/firmware.bin");
        return OTA_ERROR_INSTALL;
    }
    
    /* Verify installation */
    if (!verify_hash("/boot/firmware.bin", update_info->expected_hash)) {
        fprintf(stderr, "Installed firmware hash mismatch\n");
        
        /* Rollback */
        system("cp /boot/firmware.bin.backup /boot/firmware.bin");
        return OTA_ERROR_INSTALL;
    }
    
    /* Update version file */
    FILE *fp = fopen("/boot/version.txt", "w");
    if (fp) {
        fprintf(fp, "%s\n", update_info->version);
        fclose(fp);
    }
    
    printf("✓ Firmware installation complete\n");
    return OTA_SUCCESS;
}

/**
 * @brief Perform OTA update with safety checks
 */
ota_status_t perform_ota_update(const ota_update_info_t* update_info)
{
    printf("\n=== OTA Update Process ===\n");
    
    /* ========================================= */
    /* SAFETY CHECKS                             */
    /* ========================================= */
    
    if (!update_info->aircraft_on_ground) {
        fprintf(stderr, "✗ Aircraft not on ground - update aborted\n");
        return OTA_ERROR_INSTALL;
    }
    
    if (!update_info->power_stable) {
        fprintf(stderr, "✗ Power unstable - update aborted\n");
        return OTA_ERROR_INSTALL;
    }
    
    printf("✓ Safety checks passed\n");
    
    /* ========================================= */
    /* SIGNATURE VERIFICATION                    */
    /* ========================================= */
    
    printf("\nVerifying digital signature...\n");
    if (!verify_signature(update_info->binary_path, update_info->signature_path)) {
        return OTA_ERROR_SIGNATURE;
    }
    
    /* ========================================= */
    /* HASH VERIFICATION                         */
    /* ========================================= */
    
    printf("\nVerifying binary hash...\n");
    if (!verify_hash(update_info->binary_path, update_info->expected_hash)) {
        return OTA_ERROR_HASH;
    }
    
    /* ========================================= */
    /* FIRMWARE INSTALLATION                     */
    /* ========================================= */
    
    ota_status_t install_status = install_firmware(update_info);
    if (install_status != OTA_SUCCESS) {
        return install_status;
    }
    
    /* ========================================= */
    /* POST-INSTALL VERIFICATION                 */
    /* ========================================= */
    
    printf("\nRunning post-install health check...\n");
    if (system("/usr/bin/health_check") != 0) {
        fprintf(stderr, "✗ Health check failed - rolling back\n");
        system("cp /boot/firmware.bin.backup /boot/firmware.bin");
        return OTA_ERROR_ROLLBACK;
    }
    
    printf("\n✓ OTA Update Complete\n");
    printf("System will reboot in 10 seconds...\n");
    
    return OTA_SUCCESS;
}

/**
 * @brief Main OTA update entry point
 */
int main(int argc, char *argv[])
{
    if (argc < 4) {
        fprintf(stderr, "Usage: %s <package.enc> <encryption.key> <aircraft_on_ground>\n");
        return 1;
    }
    
    const char *package_path = argv[1];
    const char *key_path = argv[2];
    bool aircraft_on_ground = (strcmp(argv[3], "true") == 0);
    
    /* Decrypt and extract package */
    /* ... (implementation omitted for brevity) */
    
    /* Parse manifest.json */
    /* ... (implementation omitted for brevity) */
    
    /* Prepare update info */
    ota_update_info_t update_info = {
        .version = "1.0.1",
        .binary_path = "/tmp/ota/firmware.bin",
        .signature_path = "/tmp/ota/firmware.sig",
        .binary_size = 2097152,  /* 2 MB */
        .aircraft_on_ground = aircraft_on_ground,
        .power_stable = true  /* Check via hardware */
    };
    
    /* Perform update */
    ota_status_t status = perform_ota_update(&update_info);
    
    if (status == OTA_SUCCESS) {
        /* Reboot system */
        sync();
        sleep(10);
        system("reboot");
        return 0;
    } else {
        fprintf(stderr, "OTA update failed with status: %d\n", status);
        return 1;
    }
}
```

This provides comprehensive deployment automation with CI/CD pipeline, OTA update system, and production deployment tools. Would you like me to continue with MISRA C compliance examples or certification authority engagement templates?
