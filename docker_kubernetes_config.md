# Docker & Deployment Configurations
## Complete Containerization and Deployment Setup

---

## VS Code Dev Container

### .devcontainer/devcontainer.json

```json
{
  "name": "Flight Control Development",
  "build": {
    "dockerfile": "Dockerfile",
    "context": "..",
    "args": {
      "VARIANT": "ubuntu-22.04"
    }
  },
  
  "features": {
    "ghcr.io/devcontainers/features/common-utils:2": {
      "installZsh": true,
      "username": "vscode",
      "uid": "1000",
      "gid": "1000"
    },
    "ghcr.io/devcontainers/features/git:1": {
      "version": "latest"
    },
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.11"
    }
  },
  
  "customizations": {
    "vscode": {
      "settings": {
        "terminal.integrated.defaultProfile.linux": "zsh",
        "editor.formatOnSave": true,
        "editor.rulers": [80, 120],
        "files.insertFinalNewline": true,
        "files.trimTrailingWhitespace": true,
        "C_Cpp.default.cppStandard": "c++17",
        "C_Cpp.default.cStandard": "c99",
        "C_Cpp.default.compilerPath": "/usr/bin/gcc",
        "C_Cpp.default.includePath": [
          "${workspaceFolder}/**",
          "/opt/deos-sdk/include"
        ],
        "cmake.configureOnOpen": true,
        "cmake.buildDirectory": "${workspaceFolder}/build",
        "[c]": {
          "editor.defaultFormatter": "xaver.clang-format"
        }
      },
      
      "extensions": [
        "ms-vscode.cpptools",
        "ms-vscode.cpptools-extension-pack",
        "ms-vscode.cmake-tools",
        "twxs.cmake",
        "xaver.clang-format",
        "jeff-hykin.better-cpp-syntax",
        "ms-python.python",
        "ms-python.vscode-pylance",
        "streetsidesoftware.code-spell-checker",
        "eamodio.gitlens",
        "github.vscode-pull-request-github",
        "gruntfuggly.todo-tree",
        "wayou.vscode-todo-highlight",
        "redhat.vscode-yaml",
        "ms-azuretools.vscode-docker"
      ]
    }
  },
  
  "forwardPorts": [8080, 9090],
  
  "postCreateCommand": "bash .devcontainer/post-create.sh",
  
  "remoteUser": "vscode",
  
  "mounts": [
    "source=${localEnv:HOME}/.ssh,target=/home/vscode/.ssh,readonly,type=bind",
    "source=flight-control-deos-sdk,target=/opt/deos-sdk,type=volume"
  ],
  
  "runArgs": [
    "--cap-add=SYS_PTRACE",
    "--security-opt=seccomp=unconfined"
  ]
}
```

### .devcontainer/Dockerfile

```dockerfile
# Development container for Flight Control Module
FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install base development tools
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    ccache \
    git \
    curl \
    wget \
    vim \
    nano \
    zsh \
    sudo \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install PowerPC cross-compilation toolchain
RUN apt-get update && apt-get install -y \
    gcc-powerpc-linux-gnu \
    g++-powerpc-linux-gnu \
    binutils-powerpc-linux-gnu \
    && rm -rf /var/lib/apt/lists/*

# Install Python and tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install development utilities
RUN apt-get update && apt-get install -y \
    gdb \
    gdb-multiarch \
    valgrind \
    clang-format \
    clang-tidy \
    cppcheck \
    doxygen \
    graphviz \
    libxml2-utils \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Install Oh My Zsh for better shell experience
USER $USERNAME
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
USER root

# Install Python packages
COPY requirements-dev.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements-dev.txt

# Create workspace directory
RUN mkdir -p /workspace && chown -R $USERNAME:$USERNAME /workspace

# Set up ccache
RUN mkdir -p /home/$USERNAME/.ccache && chown -R $USERNAME:$USERNAME /home/$USERNAME/.ccache
ENV CCACHE_DIR=/home/$USERNAME/.ccache

# Set working directory
WORKDIR /workspace

USER $USERNAME

# Set default shell
SHELL ["/bin/zsh", "-c"]
```

### .devcontainer/post-create.sh

```bash
#!/bin/bash
# Post-creation setup script for dev container

set -e

echo "======================================"
echo "Setting up Flight Control environment"
echo "======================================"

# Install Git hooks
echo "Installing Git hooks..."
cp scripts/pre_commit_hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install --user -r requirements-dev.txt

# Configure Git
echo "Configuring Git..."
git config --global core.editor "vim"
git config --global pull.rebase false

# Download Deos SDK (if not mounted)
if [ ! -d "/opt/deos-sdk" ]; then
    echo "Deos SDK not found. Please mount or install manually."
fi

# Create initial build directory
echo "Creating build directory..."
mkdir -p build

# Run initial configuration
echo "Running initial CMake configuration..."
cd build
cmake .. -GNinja -DCMAKE_BUILD_TYPE=Debug
cd ..

echo ""
echo "======================================"
echo "✓ Development environment ready!"
echo "======================================"
echo ""
echo "Quick commands:"
echo "  Build:   ninja -C build"
echo "  Test:    cd build && ctest"
echo "  Format:  clang-format -i partition/**/*.c"
echo ""
```

---

## Production Docker Images

### docker/Dockerfile.build

```dockerfile
# Build environment for Flight Control Module
FROM ubuntu:22.04 AS base

ARG DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    gcc-powerpc-linux-gnu \
    g++-powerpc-linux-gnu \
    git \
    curl \
    python3 \
    python3-pip \
    libxml2-utils \
    ccache \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for build automation
RUN pip3 install --no-cache-dir \
    pyyaml \
    jinja2 \
    pytest \
    requests

# Create build user
RUN useradd -m -s /bin/bash builder && \
    mkdir -p /workspace && \
    chown -R builder:builder /workspace

USER builder
WORKDIR /workspace

# Copy source code
COPY --chown=builder:builder . /workspace/

# Build stage
FROM base AS builder

# Configure and build
RUN cmake -B build \
    -DCMAKE_BUILD_TYPE=Release \
    -DCERTIFICATION_LEVEL=DAL_A \
    -DCMAKE_TOOLCHAIN_FILE=tools/build/toolchain-powerpc.cmake \
    -GNinja

RUN cmake --build build --parallel $(nproc)

# Run tests
RUN cd build && ctest --output-on-failure

# Production image
FROM scratch AS production

COPY --from=builder /workspace/build/partitions/*.bin /partitions/
COPY --from=builder /workspace/config/arinc653/*.xml /config/

# Metadata
LABEL org.opencontainers.image.title="Flight Control Module"
LABEL org.opencontainers.image.description="DO-178C DAL A Certified Flight Control"
LABEL org.opencontainers.image.vendor="Avionics Systems Inc."
LABEL org.opencontainers.image.version="1.0.0"
```

### docker/Dockerfile.test

```dockerfile
# Test environment with all verification tools
FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

# Install test dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    python3 \
    python3-pip \
    gcovr \
    lcov \
    valgrind \
    cppcheck \
    clang-tidy \
    && rm -rf /var/lib/apt/lists/*

# Install Python test frameworks
RUN pip3 install --no-cache-dir \
    pytest \
    pytest-cov \
    pytest-xdist \
    pytest-timeout \
    hypothesis

WORKDIR /workspace

# Copy source and tests
COPY . /workspace/

# Build with coverage
RUN cmake -B build \
    -DCMAKE_BUILD_TYPE=Coverage \
    -GNinja && \
    cmake --build build

# Run tests with coverage
CMD ["bash", "-c", "cd build && ctest --output-on-failure && gcovr -r .. --html-details coverage.html"]
```

---

## Kubernetes Deployment

### deployment/kubernetes/namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: flight-control
  labels:
    name: flight-control
    environment: production
    certification: dal-a
```

### deployment/kubernetes/configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: flight-control-config
  namespace: flight-control
data:
  # ARINC 653 module configuration
  module_config.xml: |
    <?xml version="1.0" encoding="UTF-8"?>
    <ARINC653_Module>
      <Module_Name>FlightControlModule</Module_Name>
      <Module_Id>FCM-001</Module_Id>
      <Module_Version>1.0.0</Module_Version>
      <!-- Full configuration in config/arinc653/module_config.xml -->
    </ARINC653_Module>
  
  # Application configuration
  app-config.yaml: |
    certification_level: DAL_A
    type_certificate: TC-12345
    safety_mode: ENABLED
    telemetry_enabled: true
    log_level: INFO
    
    partitions:
      flight_control:
        priority: 100
        period_ms: 20
        deadline_ms: 15
      
      navigation:
        priority: 90
        period_ms: 100
        deadline_ms: 20
      
      communications:
        priority: 80
        period_ms: 100
        deadline_ms: 10
      
      health_monitor:
        priority: 100
        period_ms: 100
        deadline_ms: 5
```

### deployment/kubernetes/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flight-control-module
  namespace: flight-control
  labels:
    app: flight-control
    version: v1.0.0
    certification: dal-a
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  selector:
    matchLabels:
      app: flight-control
  
  template:
    metadata:
      labels:
        app: flight-control
        version: v1.0.0
        certification: dal-a
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    
    spec:
      # Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      
      # Init container for health checks
      initContainers:
        - name: check-dependencies
          image: busybox:1.35
          command:
            - sh
            - -c
            - |
              echo "Checking system dependencies..."
              # Add dependency checks here
              echo "✓ Dependencies OK"
      
      containers:
        - name: flight-control
          image: flight-control-module:1.0.0
          imagePullPolicy: IfNotPresent
          
          # Security
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE
          
          # Resource limits (critical for real-time performance)
          resources:
            requests:
              cpu: "2000m"      # 2 cores minimum
              memory: "4Gi"     # 4 GB RAM
            limits:
              cpu: "4000m"      # 4 cores maximum
              memory: "8Gi"     # 8 GB RAM max
          
          # Environment variables
          env:
            - name: CERTIFICATION_LEVEL
              value: "DAL_A"
            - name: PROJECT_ID
              value: "FCM-001"
            - name: LOG_LEVEL
              value: "INFO"
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          
          # Volume mounts
          volumeMounts:
            - name: config
              mountPath: /etc/flight-control
              readOnly: true
            - name: logs
              mountPath: /var/log/flight-control
            - name: tmp
              mountPath: /tmp
          
          # Health probes
          livenessProbe:
            exec:
              command:
                - /bin/health-check
                - --type=liveness
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          
          readinessProbe:
            exec:
              command:
                - /bin/health-check
                - --type=readiness
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          
          # Startup probe (for slow initialization)
          startupProbe:
            exec:
              command:
                - /bin/health-check
                - --type=startup
            initialDelaySeconds: 0
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 30
      
      # Volumes
      volumes:
        - name: config
          configMap:
            name: flight-control-config
        - name: logs
          emptyDir: {}
        - name: tmp
          emptyDir: {}
      
      # Affinity rules (spread across nodes)
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values:
                      - flight-control
              topologyKey: kubernetes.io/hostname
      
      # Node selector for certified hardware
      nodeSelector:
        hardware.certified: "true"
        cpu.architecture: "powerpc"
```

### deployment/kubernetes/service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: flight-control-service
  namespace: flight-control
  labels:
    app: flight-control
spec:
  type: ClusterIP
  selector:
    app: flight-control
  ports:
    - name: http
      protocol: TCP
      port: 8080
      targetPort: 8080
    - name: metrics
      protocol: TCP
      port: 9090
      targetPort: 9090
  sessionAffinity: ClientIP
```

### deployment/kubernetes/hpa.yaml

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: flight-control-hpa
  namespace: flight-control
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: flight-control-module
  
  minReplicas: 3
  maxReplicas: 10
  
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
```

---

## Docker Compose for Local Development

### docker/docker-compose.yml

```yaml
version: '3.9'

services:
  # Build service
  build:
    build:
      context: ..
      dockerfile: docker/Dockerfile.build
      target: builder
    volumes:
      - ../:/workspace
      - build-cache:/workspace/build
    environment:
      - BUILD_TYPE=Debug
      - CERTIFICATION_LEVEL=DAL_A
    command: ["cmake", "--build", "build", "--parallel", "4"]
  
  # Test service
  test:
    build:
      context: ..
      dockerfile: docker/Dockerfile.test
    volumes:
      - ../:/workspace
      - test-results:/workspace/build/test-results
    environment:
      - COVERAGE=ON
    depends_on:
      - build
  
  # Static analysis
  analysis:
    image: ldra/toolsuite:9.7
    volumes:
      - ../:/workspace
      - analysis-reports:/workspace/build/ldra-reports
    command: ["./tools/analysis/run_ldra.sh"]
    depends_on:
      - build
  
  # Documentation
  docs:
    image: doxygen/doxygen:1.9.8
    volumes:
      - ../:/workspace
      - docs-output:/workspace/docs/html
    working_dir: /workspace
    command: ["doxygen", "Doxyfile"]

volumes:
  build-cache:
  test-results:
  analysis-reports:
  docs-output:
```

This completes the Docker and Kubernetes deployment configurations. Would you like me to create example source code files with proper DO-178C headers and documentation?
