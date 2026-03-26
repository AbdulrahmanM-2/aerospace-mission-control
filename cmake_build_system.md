# Production CMake Build System
## Complete Build Configuration for DO-178C Avionics Software

---

## Root CMakeLists.txt

```cmake
# Flight Control Module - Root CMakeLists.txt
# DO-178C DAL A Certified Avionics Software
cmake_minimum_required(VERSION 3.20)

# Project metadata
project(FlightControlModule
    VERSION 1.0.0
    DESCRIPTION "DO-178C DAL A Flight Control Software"
    LANGUAGES C CXX ASM
)

# ============================================================================
# PROJECT CONFIGURATION
# ============================================================================

# Set C standard
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# Build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Debug" CACHE STRING "Build type" FORCE)
endif()

set_property(CACHE CMAKE_BUILD_TYPE PROPERTY STRINGS
    "Debug" "Release" "Certification" "Coverage"
)

# Certification level
set(CERTIFICATION_LEVEL "DAL_A" CACHE STRING "DO-178C certification level")
set_property(CACHE CERTIFICATION_LEVEL PROPERTY STRINGS
    "DAL_A" "DAL_B" "DAL_C" "DAL_D"
)

# Target platform
set(TARGET_PLATFORM "qoriq-t2080" CACHE STRING "Target hardware platform")

# Project ID
set(PROJECT_ID "FCM-001" CACHE STRING "Project identifier")
set(TYPE_CERTIFICATE "TC-12345" CACHE STRING "Type certificate number")

# ============================================================================
# COMPILER FLAGS
# ============================================================================

# Warning flags (all warnings as errors for certification)
set(WARNING_FLAGS
    -Wall
    -Wextra
    -Werror
    -Wpedantic
    -Wshadow
    -Wpointer-arith
    -Wcast-qual
    -Wcast-align
    -Wwrite-strings
    -Wconversion
    -Wsign-conversion
    -Wmissing-prototypes
    -Wstrict-prototypes
    -Wredundant-decls
    -Wnested-externs
    -Winline
    -Wno-long-long
    -Wfloat-equal
    -Wundef
)

add_compile_options(${WARNING_FLAGS})

# Debug build flags
set(CMAKE_C_FLAGS_DEBUG
    "-O0 -g3 -DDEBUG -fno-omit-frame-pointer"
)

# Release build flags (optimization for size and determinism)
set(CMAKE_C_FLAGS_RELEASE
    "-O2 -DNDEBUG -ffunction-sections -fdata-sections"
)

# Certification build flags (maximum checking, no optimization)
set(CMAKE_C_FLAGS_CERTIFICATION
    "-O1 -g3 -DCERTIFICATION_BUILD -fno-omit-frame-pointer \
     -fstack-protector-strong -D_FORTIFY_SOURCE=2"
)

# Coverage build flags (for MC/DC analysis)
set(CMAKE_C_FLAGS_COVERAGE
    "-O0 -g3 --coverage -fprofile-arcs -ftest-coverage"
)
set(CMAKE_EXE_LINKER_FLAGS_COVERAGE
    "--coverage -fprofile-arcs"
)

# MISRA C compliance
add_compile_definitions(
    MISRA_C_2012
    $<$<CONFIG:Certification>:CERTIFICATION_LEVEL_${CERTIFICATION_LEVEL}>
)

# ============================================================================
# PATHS AND DIRECTORIES
# ============================================================================

set(CONFIG_DIR ${CMAKE_SOURCE_DIR}/config)
set(PARTITION_DIR ${CMAKE_SOURCE_DIR}/partition)
set(COMMON_DIR ${CMAKE_SOURCE_DIR}/common)
set(TESTS_DIR ${CMAKE_SOURCE_DIR}/tests)
set(TOOLS_DIR ${CMAKE_SOURCE_DIR}/tools)
set(DOCS_DIR ${CMAKE_SOURCE_DIR}/docs)

# Output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# ============================================================================
# EXTERNAL DEPENDENCIES
# ============================================================================

# Deos RTOS SDK
set(DEOS_SDK_PATH "/opt/deos-sdk" CACHE PATH "Path to Deos SDK")

if(EXISTS ${DEOS_SDK_PATH})
    set(DEOS_FOUND TRUE)
    include_directories(${DEOS_SDK_PATH}/include)
    link_directories(${DEOS_SDK_PATH}/lib)
else()
    message(WARNING "Deos SDK not found at ${DEOS_SDK_PATH}")
    set(DEOS_FOUND FALSE)
endif()

# ARINC 653 APEX library
find_library(ARINC653_LIB
    NAMES arinc653 apex
    PATHS ${DEOS_SDK_PATH}/lib
    NO_DEFAULT_PATH
)

if(ARINC653_LIB)
    message(STATUS "Found ARINC 653 library: ${ARINC653_LIB}")
else()
    message(FATAL_ERROR "ARINC 653 library not found")
endif()

# ============================================================================
# CUSTOM FUNCTIONS
# ============================================================================

# Function to add a partition executable
function(add_partition PARTITION_NAME DAL_LEVEL)
    set(TARGET_NAME ${PARTITION_NAME})
    
    # Add executable
    add_executable(${TARGET_NAME} ${ARGN})
    
    # Set properties
    set_target_properties(${TARGET_NAME} PROPERTIES
        OUTPUT_NAME "${PARTITION_NAME}_v${PROJECT_VERSION}"
        RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/partitions
    )
    
    # Link libraries
    target_link_libraries(${TARGET_NAME}
        PRIVATE
            ${ARINC653_LIB}
            common
            m  # Math library
    )
    
    # Include directories
    target_include_directories(${TARGET_NAME}
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/include
            ${COMMON_DIR}/include
            ${DEOS_SDK_PATH}/include
    )
    
    # Compile definitions
    target_compile_definitions(${TARGET_NAME}
        PRIVATE
            PARTITION_NAME="${PARTITION_NAME}"
            DAL_LEVEL=${DAL_LEVEL}
            PROJECT_VERSION="${PROJECT_VERSION}"
    )
    
    # Generate map file
    target_link_options(${TARGET_NAME}
        PRIVATE
            -Wl,-Map=${CMAKE_BINARY_DIR}/partitions/${PARTITION_NAME}.map
            -Wl,--gc-sections
    )
    
    # Create binary output
    add_custom_command(TARGET ${TARGET_NAME} POST_BUILD
        COMMAND ${CMAKE_OBJCOPY} -O binary
            $<TARGET_FILE:${TARGET_NAME}>
            ${CMAKE_BINARY_DIR}/partitions/${PARTITION_NAME}.bin
        COMMENT "Creating binary for ${PARTITION_NAME}"
    )
    
    # Generate disassembly
    add_custom_command(TARGET ${TARGET_NAME} POST_BUILD
        COMMAND ${CMAKE_OBJDUMP} -d
            $<TARGET_FILE:${TARGET_NAME}>
            > ${CMAKE_BINARY_DIR}/partitions/${PARTITION_NAME}.dis
        COMMENT "Creating disassembly for ${PARTITION_NAME}"
    )
    
    message(STATUS "Added partition: ${PARTITION_NAME} (DAL ${DAL_LEVEL})")
endfunction()

# Function to add unit tests
function(add_unit_test TEST_NAME)
    add_executable(${TEST_NAME} ${ARGN})
    
    target_link_libraries(${TEST_NAME}
        PRIVATE
            common
            ${ARINC653_LIB}
    )
    
    target_include_directories(${TEST_NAME}
        PRIVATE
            ${COMMON_DIR}/include
            ${TESTS_DIR}/unit
    )
    
    add_test(NAME ${TEST_NAME}
        COMMAND ${TEST_NAME}
        WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
    )
    
    set_tests_properties(${TEST_NAME} PROPERTIES
        TIMEOUT 60
        LABELS "unit"
    )
endfunction()

# ============================================================================
# SUBDIRECTORIES
# ============================================================================

# Enable testing
enable_testing()

# Add subdirectories
add_subdirectory(common)
add_subdirectory(partition/flight_control)
add_subdirectory(partition/navigation)
add_subdirectory(partition/communications)
add_subdirectory(partition/health_monitor)

# Tests (only in Debug or Coverage builds)
if(CMAKE_BUILD_TYPE MATCHES "Debug|Coverage")
    add_subdirectory(tests/unit)
endif()

# ============================================================================
# CUSTOM TARGETS
# ============================================================================

# Static analysis target
add_custom_target(static-analysis
    COMMAND ${CMAKE_SOURCE_DIR}/tools/analysis/run_ldra.sh
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Running LDRA static analysis (MISRA C:2012)"
)

# Coverage analysis target
add_custom_target(coverage
    COMMAND ${CMAKE_SOURCE_DIR}/tools/analysis/run_rapita.sh
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
    COMMENT "Running Rapita coverage analysis (MC/DC)"
    DEPENDS flight_control navigation communications health_monitor
)

# WCET analysis target
add_custom_target(wcet-analysis
    COMMAND ${CMAKE_SOURCE_DIR}/tools/analysis/run_rapitime.sh
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
    COMMENT "Running Rapita WCET analysis"
    DEPENDS flight_control
)

# Documentation target
add_custom_target(docs
    COMMAND doxygen ${CMAKE_SOURCE_DIR}/Doxyfile
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Generating API documentation with Doxygen"
)

# Traceability matrix target
add_custom_target(traceability
    COMMAND python3 ${TOOLS_DIR}/analysis/generate_traceability.py
        --requirements ${CMAKE_SOURCE_DIR}/requirements/requirements.csv
        --source ${PARTITION_DIR}
        --tests ${TESTS_DIR}
        --output ${CMAKE_BINARY_DIR}/traceability_matrix.html
    COMMENT "Generating requirements traceability matrix"
)

# Size report target
add_custom_target(size-report
    COMMAND ${CMAKE_SIZE} ${CMAKE_BINARY_DIR}/partitions/*.elf > 
        ${CMAKE_BINARY_DIR}/size_report.txt
    COMMENT "Generating memory size report"
)

# Certification evidence package
add_custom_target(cert-package
    COMMAND ${CMAKE_SOURCE_DIR}/scripts/generate_cert_package.sh
        --build-dir ${CMAKE_BINARY_DIR}
        --version ${PROJECT_VERSION}
        --output ${CMAKE_BINARY_DIR}/certification_package.tar.gz
    COMMENT "Creating certification evidence package"
    DEPENDS static-analysis coverage wcet-analysis traceability
)

# Clean all build artifacts
add_custom_target(clean-all
    COMMAND ${CMAKE_COMMAND} -E remove_directory ${CMAKE_BINARY_DIR}
    COMMENT "Removing all build artifacts"
)

# ============================================================================
# INSTALLATION
# ============================================================================

# Install partitions
install(DIRECTORY ${CMAKE_BINARY_DIR}/partitions/
    DESTINATION bin
    FILES_MATCHING PATTERN "*.bin"
)

# Install configuration files
install(DIRECTORY ${CONFIG_DIR}/arinc653/
    DESTINATION etc/arinc653
    FILES_MATCHING PATTERN "*.xml"
)

# Install documentation
install(DIRECTORY ${DOCS_DIR}/
    DESTINATION share/doc/flight-control-module
)

# ============================================================================
# SUMMARY
# ============================================================================

message(STATUS "")
message(STATUS "========================================")
message(STATUS "Flight Control Module Build Configuration")
message(STATUS "========================================")
message(STATUS "Version:             ${PROJECT_VERSION}")
message(STATUS "Build type:          ${CMAKE_BUILD_TYPE}")
message(STATUS "Certification level: ${CERTIFICATION_LEVEL}")
message(STATUS "Target platform:     ${TARGET_PLATFORM}")
message(STATUS "Project ID:          ${PROJECT_ID}")
message(STATUS "Type certificate:    ${TYPE_CERTIFICATE}")
message(STATUS "C compiler:          ${CMAKE_C_COMPILER}")
message(STATUS "Deos SDK:            ${DEOS_SDK_PATH}")
message(STATUS "ARINC 653 library:   ${ARINC653_LIB}")
message(STATUS "========================================")
message(STATUS "")
```

---

## Partition CMakeLists.txt

### partition/flight_control/CMakeLists.txt

```cmake
# Flight Control Partition (DAL A)
# Primary flight control laws

set(PARTITION_NAME flight_control)
set(DAL_LEVEL A)

# Source files
set(SOURCES
    src/flight_control_main.c
    src/control_law.c
    src/pid_controller.c
    src/arinc653_ports.c
    src/sensor_processing.c
    src/safety_monitor.c
)

# Header files (for IDE)
set(HEADERS
    include/control_law.h
    include/pid_controller.h
    include/arinc653_ports.h
    include/sensor_processing.h
    include/safety_monitor.h
)

# Create partition executable
add_partition(${PARTITION_NAME} ${DAL_LEVEL} ${SOURCES})

# Additional compile definitions for flight control
target_compile_definitions(${PARTITION_NAME}
    PRIVATE
        FC_TASK_PRIORITY=100
        FC_PERIOD_MS=20
        MAX_CONTROL_SURFACE_DEG=25.0
)

# Install headers (for testing)
install(DIRECTORY include/
    DESTINATION include/flight_control
    FILES_MATCHING PATTERN "*.h"
)
```

---

## Toolchain File

### tools/build/toolchain-powerpc.cmake

```cmake
# CMake toolchain file for PowerPC cross-compilation
# Target: NXP QorIQ T2080 (PowerPC e6500)

set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR powerpc)

# Cross-compiler paths
set(CROSS_COMPILE "powerpc-eabispe-")

find_program(CMAKE_C_COMPILER ${CROSS_COMPILE}gcc)
find_program(CMAKE_CXX_COMPILER ${CROSS_COMPILE}g++)
find_program(CMAKE_ASM_COMPILER ${CROSS_COMPILE}gcc)
find_program(CMAKE_OBJCOPY ${CROSS_COMPILE}objcopy)
find_program(CMAKE_OBJDUMP ${CROSS_COMPILE}objdump)
find_program(CMAKE_SIZE ${CROSS_COMPILE}size)
find_program(CMAKE_AR ${CROSS_COMPILE}ar)
find_program(CMAKE_RANLIB ${CROSS_COMPILE}ranlib)

if(NOT CMAKE_C_COMPILER)
    message(FATAL_ERROR "PowerPC cross-compiler not found. Install gcc-powerpc-eabispe")
endif()

# Compiler flags for PowerPC e6500
set(CMAKE_C_FLAGS_INIT
    "-mcpu=e6500 -m32 -mspe=yes -mabi=spe -mfloat-gprs=double \
     -mstrict-align -fno-common"
)

# Linker flags
set(CMAKE_EXE_LINKER_FLAGS_INIT
    "-Wl,--gc-sections -Wl,--as-needed"
)

# Search paths
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# Cache variables
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS_INIT}" CACHE STRING "C compiler flags")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS_INIT}" 
    CACHE STRING "Linker flags")
```

---

## Build Scripts

### tools/build/build.sh

```bash
#!/bin/bash
# Production build script for Flight Control Module
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Default values
BUILD_TYPE="${BUILD_TYPE:-Release}"
CERTIFICATION_LEVEL="${CERTIFICATION_LEVEL:-DAL_A}"
BUILD_DIR="${BUILD_DIR:-${PROJECT_ROOT}/build}"
JOBS="${JOBS:-$(nproc)}"
CROSS_COMPILE="${CROSS_COMPILE:-0}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --debug)
            BUILD_TYPE="Debug"
            shift
            ;;
        --release)
            BUILD_TYPE="Release"
            shift
            ;;
        --certification)
            BUILD_TYPE="Certification"
            shift
            ;;
        --coverage)
            BUILD_TYPE="Coverage"
            shift
            ;;
        --cross)
            CROSS_COMPILE=1
            shift
            ;;
        --clean)
            rm -rf "${BUILD_DIR}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "======================================"
echo "Flight Control Module Build"
echo "======================================"
echo "Build type:          ${BUILD_TYPE}"
echo "Certification level: ${CERTIFICATION_LEVEL}"
echo "Build directory:     ${BUILD_DIR}"
echo "Cross-compile:       ${CROSS_COMPILE}"
echo "Parallel jobs:       ${JOBS}"
echo "======================================"

# Create build directory
mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

# Configure CMake
CMAKE_ARGS=(
    -DCMAKE_BUILD_TYPE="${BUILD_TYPE}"
    -DCERTIFICATION_LEVEL="${CERTIFICATION_LEVEL}"
    -DPROJECT_ID="FCM-001"
    -DTYPE_CERTIFICATE="TC-12345"
    -GNinja
)

if [ ${CROSS_COMPILE} -eq 1 ]; then
    CMAKE_ARGS+=(-DCMAKE_TOOLCHAIN_FILE="${PROJECT_ROOT}/tools/build/toolchain-powerpc.cmake")
fi

echo ""
echo "Configuring..."
cmake "${CMAKE_ARGS[@]}" "${PROJECT_ROOT}"

echo ""
echo "Building..."
ninja -j${JOBS}

echo ""
echo "======================================"
echo "Build complete!"
echo "Partitions: ${BUILD_DIR}/partitions/"
echo "======================================"

# Generate size report
if command -v powerpc-eabispe-size &> /dev/null; then
    echo ""
    echo "Memory usage:"
    powerpc-eabispe-size ${BUILD_DIR}/partitions/*.elf
fi
```

This provides a complete, production-grade CMake build system. Would you like me to continue with GitHub Actions workflows next?
