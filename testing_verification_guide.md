# DO-178C Testing & Verification Guide
## Complete Test Strategy for DAL A Certification

---

## 1. Test Strategy Overview

### 1.1 DO-178C DAL A Testing Requirements

**Mandatory Coverage for DAL A:**
- Statement Coverage: 100%
- Branch Coverage: 100%  
- Modified Condition/Decision Coverage (MC/DC): 100%
- Data Coupling: Verified
- Control Coupling: Verified

**Test Types Required:**
1. Requirements-Based Testing (Black-Box)
2. Structural Coverage Testing (White-Box)
3. Robustness Testing (Boundary, Error Injection)
4. Integration Testing (Partition-to-Partition)
5. Hardware-in-the-Loop (HIL) Testing
6. Timing Analysis (WCET Verification)

---

## 2. MC/DC Coverage - Theory and Practice

### 2.1 Understanding MC/DC

Modified Condition/Decision Coverage ensures that:
1. Every condition in a decision independently affects the outcome
2. Every condition takes on all possible outcomes
3. Each condition is shown to independently affect the decision outcome

**Example Decision:**
```c
if ((altitude > 10000) && (airspeed < 250) || (emergency_mode))
{
    activate_high_altitude_logic();
}
```

**Conditions:**
- A: altitude > 10000
- B: airspeed < 250  
- C: emergency_mode

**Decision:** (A && B) || C

### 2.2 MC/DC Test Case Generation

To achieve MC/DC, each condition must independently toggle the result.

**Test Table:**

| Test | A | B | C | A&&B | Result | Independent Condition |
|------|---|---|---|------|--------|----------------------|
| 1    | T | T | F | T    | **T**  | Baseline             |
| 2    | F | T | F | F    | **F**  | A toggles            |
| 3    | T | F | F | F    | **F**  | B toggles            |
| 4    | F | F | T | F    | **T**  | C toggles            |

**Verification:**
- Test 1→2: Only A changes (T→F), result changes (T→F) ✓
- Test 1→3: Only B changes (T→F), result changes (T→F) ✓  
- Test 4→2: Only C changes (T→F), result changes (T→F) ✓

All conditions independently verified. MC/DC achieved with 4 tests.

### 2.3 Automated MC/DC Test Generation

```python
#!/usr/bin/env python3
"""
MC/DC Test Case Generator
Generates minimum test set for MC/DC coverage
"""

import itertools
from typing import List, Tuple, Dict

def evaluate_decision(conditions: Tuple[bool, ...], expression: str) -> bool:
    """
    Evaluate decision expression with given condition values
    
    Args:
        conditions: Tuple of condition values (A, B, C, ...)
        expression: Decision expression using A, B, C notation
    
    Returns:
        Boolean result of decision
    """
    # Map condition letters to values
    mapping = {chr(65 + i): cond for i, cond in enumerate(conditions)}
    
    # Replace condition letters with actual values
    eval_expr = expression
    for letter, value in mapping.items():
        eval_expr = eval_expr.replace(letter, str(value))
    
    # Evaluate
    return eval(eval_expr)

def find_mcdc_pairs(num_conditions: int, expression: str) -> List[Tuple[int, int, int]]:
    """
    Find MC/DC test pairs for each condition
    
    Args:
        num_conditions: Number of conditions in decision
        expression: Decision expression
    
    Returns:
        List of (test1_index, test2_index, condition_index) tuples
    """
    # Generate all possible condition combinations
    all_tests = list(itertools.product([False, True], repeat=num_conditions))
    
    # Evaluate decision for each combination
    results = [(test, evaluate_decision(test, expression)) for test in all_tests]
    
    mcdc_pairs = []
    
    # For each condition
    for cond_idx in range(num_conditions):
        # Find test pairs where only this condition differs
        for i, (test1, result1) in enumerate(results):
            for j, (test2, result2) in enumerate(results):
                if i >= j:
                    continue
                
                # Check if only condition cond_idx differs
                differs_only_at = [idx for idx in range(num_conditions) 
                                  if test1[idx] != test2[idx]]
                
                if len(differs_only_at) == 1 and differs_only_at[0] == cond_idx:
                    # Check if result differs
                    if result1 != result2:
                        mcdc_pairs.append((i, j, cond_idx))
                        break
            else:
                continue
            break
    
    return mcdc_pairs

def generate_mcdc_test_suite(num_conditions: int, expression: str) -> Dict:
    """
    Generate minimal MC/DC test suite
    
    Args:
        num_conditions: Number of conditions
        expression: Decision expression
    
    Returns:
        Dictionary with test cases and coverage info
    """
    all_tests = list(itertools.product([False, True], repeat=num_conditions))
    results = [(test, evaluate_decision(test, expression)) for test in all_tests]
    
    mcdc_pairs = find_mcdc_pairs(num_conditions, expression)
    
    # Extract unique test indices
    test_indices = set()
    for t1, t2, _ in mcdc_pairs:
        test_indices.add(t1)
        test_indices.add(t2)
    
    # Build test suite
    test_suite = {
        'expression': expression,
        'num_conditions': num_conditions,
        'total_combinations': len(all_tests),
        'mcdc_test_count': len(test_indices),
        'tests': []
    }
    
    for idx in sorted(test_indices):
        test, result = results[idx]
        test_suite['tests'].append({
            'test_id': idx + 1,
            'conditions': test,
            'result': result
        })
    
    test_suite['pairs'] = [
        {
            'condition': chr(65 + cond_idx),
            'test1': t1 + 1,
            'test2': t2 + 1
        }
        for t1, t2, cond_idx in mcdc_pairs
    ]
    
    return test_suite

# Example usage
if __name__ == "__main__":
    # Decision: (A && B) || C
    expression = "(A and B) or C"
    suite = generate_mcdc_test_suite(3, expression)
    
    print(f"Decision: {suite['expression']}")
    print(f"Total combinations: {suite['total_combinations']}")
    print(f"MC/DC tests required: {suite['mcdc_test_count']}")
    print("\nTest Cases:")
    
    for test in suite['tests']:
        conds = ', '.join([f"{chr(65+i)}={test['conditions'][i]}" 
                          for i in range(len(test['conditions']))])
        print(f"  Test {test['test_id']}: {conds} → {test['result']}")
    
    print("\nMC/DC Pairs:")
    for pair in suite['pairs']:
        print(f"  Condition {pair['condition']}: Test {pair['test1']} ↔ Test {pair['test2']}")
```

---

## 3. Unit Testing with VectorCAST

### 3.1 VectorCAST Test Harness Setup

**Project Configuration:**
```bash
# VectorCAST environment creation
vcast -e FlightControl.env create

# Add source files
vcast -e FlightControl.env \
      source add control_law.c sensor_processing.c

# Configure compiler
vcast -e FlightControl.env \
      compiler set powerpc-eabispe-gcc

# Set coverage requirements
vcast -e FlightControl.env \
      coverage enable MC_DC
```

### 3.2 Example Unit Test Script

**Test: `control_law.c::compute_pid()`**

```c
/***********************************************
 * VectorCAST Test Script
 * Function: compute_pid
 * Coverage: MC/DC, Boundary Value Analysis
 ***********************************************/

TEST.UNIT: control_law
TEST.SUBPROGRAM: compute_pid
TEST.NEW
TEST.NAME: test_pid_proportional_term
TEST.REQUIREMENT_KEY: SRS-FC-032
TEST.VALUE: control_law.error, 5.0
TEST.VALUE: control_law.integral, 0.0
TEST.VALUE: control_law.prev_error, 0.0
TEST.VALUE: control_law.kp, 2.5
TEST.VALUE: control_law.ki, 0.0
TEST.VALUE: control_law.kd, 0.0
TEST.VALUE: control_law.max_integral, 10.0
TEST.EXPECTED: control_law.compute_pid.return, 12.5
TEST.END

TEST.NEW
TEST.NAME: test_pid_integral_windup
TEST.REQUIREMENT_KEY: SRS-FC-033
TEST.NOTES: Verify integrator clamps at max_integral limit
TEST.VALUE: control_law.error, 20.0
TEST.VALUE: control_law.integral, 9.5
TEST.VALUE: control_law.prev_error, 15.0
TEST.VALUE: control_law.kp, 0.0
TEST.VALUE: control_law.ki, 1.0
TEST.VALUE: control_law.kd, 0.0
TEST.VALUE: control_law.max_integral, 10.0
TEST.EXPECTED: control_law.integral, 10.0  /* Should clamp */
TEST.EXPECTED: control_law.compute_pid.return, 10.0
TEST.END

TEST.NEW
TEST.NAME: test_pid_derivative_term
TEST.REQUIREMENT_KEY: SRS-FC-032
TEST.VALUE: control_law.error, 10.0
TEST.VALUE: control_law.integral, 0.0
TEST.VALUE: control_law.prev_error, 5.0
TEST.VALUE: control_law.kp, 0.0
TEST.VALUE: control_law.ki, 0.0
TEST.VALUE: control_law.kd, 0.3
TEST.VALUE: control_law.max_integral, 10.0
TEST.EXPECTED: control_law.compute_pid.return, 75.0  /* (10-5)/0.02 * 0.3 */
TEST.END

TEST.NEW
TEST.NAME: test_pid_negative_error
TEST.REQUIREMENT_KEY: SRS-FC-034
TEST.VALUE: control_law.error, -8.0
TEST.VALUE: control_law.integral, 0.0
TEST.VALUE: control_law.prev_error, 0.0
TEST.VALUE: control_law.kp, 2.5
TEST.VALUE: control_law.ki, 0.8
TEST.VALUE: control_law.kd, 0.3
TEST.VALUE: control_law.max_integral, 10.0
TEST.EXPECTED: control_law.compute_pid.return, < 0  /* Negative output */
TEST.END
```

### 3.3 Running Tests and Generating Coverage Report

```bash
# Build test harness
vcast -e FlightControl.env build

# Execute all tests
vcast -e FlightControl.env execute batch

# Generate MC/DC coverage report
vcast -e FlightControl.env \
      reports custom mcdc_coverage.html

# Export results for traceability
vcast -e FlightControl.env \
      export results test_results.xml

# Verify 100% coverage
vcast -e FlightControl.env \
      coverage verify MC_DC 100
```

**Expected Output:**
```
================== Coverage Summary ==================
Statement Coverage:     100.0%  (487/487)
Branch Coverage:        100.0%  (152/152)
MC/DC Coverage:         100.0%  (328/328)
Function Coverage:      100.0%  (24/24)

Requirements Traceability:
  Covered Requirements:   42/42   (100%)
  Tested Requirements:    42/42   (100%)
  Verified Requirements:  42/42   (100%)

Status: PASS ✓
All DO-178C DAL A objectives satisfied
=====================================================
```

---

## 4. Integration Testing

### 4.1 ARINC 653 Inter-Partition Communication Test

**Test Objective:** Verify sampling port communication between Flight Control and Navigation partitions

**Test Setup:**
```c
/**
 * Integration Test: Sampling Port Communication
 * Partitions: FlightControl (source) → Navigation (destination)
 */

/* FlightControl partition - sender */
void integration_test_sampling_port_send(void)
{
    RETURN_CODE_TYPE ret;
    position_data_t position;
    SAMPLING_PORT_ID_TYPE port_id;
    
    /* Initialize test data */
    position.latitude = 37.7749;
    position.longitude = -122.4194;
    position.altitude = 10500.0;
    position.timestamp = get_system_time_ms();
    
    /* Get port handle */
    GET_SAMPLING_PORT_ID("FC_to_NAV_Position", &port_id, &ret);
    assert(ret == NO_ERROR);
    
    /* Write message */
    WRITE_SAMPLING_MESSAGE(
        port_id,
        (MESSAGE_ADDR_TYPE)&position,
        sizeof(position_data_t),
        &ret
    );
    
    assert(ret == NO_ERROR);
    log_test("Sampling port write successful");
}

/* Navigation partition - receiver */
void integration_test_sampling_port_receive(void)
{
    RETURN_CODE_TYPE ret;
    position_data_t position;
    MESSAGE_SIZE_TYPE msg_size;
    VALIDITY_TYPE validity;
    SAMPLING_PORT_ID_TYPE port_id;
    
    /* Get port handle */
    GET_SAMPLING_PORT_ID("FC_to_NAV_Position", &port_id, &ret);
    assert(ret == NO_ERROR);
    
    /* Read message */
    READ_SAMPLING_MESSAGE(
        port_id,
        (MESSAGE_ADDR_TYPE)&position,
        &msg_size,
        &validity,
        &ret
    );
    
    assert(ret == NO_ERROR);
    assert(msg_size == sizeof(position_data_t));
    assert(validity == VALID);
    
    /* Verify data integrity */
    assert(position.latitude == 37.7749);
    assert(position.longitude == -122.4194);
    assert(position.altitude == 10500.0);
    
    log_test("Sampling port read successful - data verified");
}
```

### 4.2 Partition Isolation Verification

**Test Objective:** Verify that partitions cannot access each other's memory

```c
/**
 * Partition Isolation Test (Negative Test)
 * Expected: Memory violation error
 */
void test_partition_memory_isolation(void)
{
    RETURN_CODE_TYPE ret;
    uint32_t* foreign_memory;
    
    /* Attempt to access Navigation partition memory from FlightControl */
    /* Navigation data region: 0x60000000 - 0x70000000 */
    /* FlightControl is at: 0x40000000 - 0x60000000 */
    
    foreign_memory = (uint32_t*)0x60000000;
    
    /* This should trigger MPU violation */
    uint32_t value = *foreign_memory;  /* Read attempt */
    
    /* Should never reach here - expecting exception */
    assert(false && "Memory isolation violated!");
}

/* Expected result: Partition error handler invoked */
/* Error code: MEMORY_VIOLATION */
/* Recovery action: Partition restart */
```

### 4.3 Timing Verification Test

**Test Objective:** Verify partition scheduling meets real-time constraints

```c
/**
 * Partition Timing Test
 * Verify: FlightControl executes within 15ms window at 50Hz
 */

typedef struct {
    uint64_t start_time_us;
    uint64_t end_time_us;
    uint64_t execution_time_us;
    uint32_t iteration;
    bool deadline_met;
} timing_measurement_t;

#define NUM_MEASUREMENTS 1000
static timing_measurement_t timing_data[NUM_MEASUREMENTS];
static uint32_t measurement_count = 0;

void flight_control_task_with_timing(void)
{
    RETURN_CODE_TYPE ret;
    uint64_t start, end;
    
    while (measurement_count < NUM_MEASUREMENTS)
    {
        /* Record start time */
        start = get_timestamp_us();
        
        /* Execute normal control loop */
        sensor_data_t sensor_input;
        control_output_t control_cmd;
        
        read_sensor_data(&sensor_input, SENSOR_TIMEOUT_MS);
        compute_control_law(&sensor_input, &control_cmd);
        write_control_output(&control_cmd);
        
        /* Record end time */
        end = get_timestamp_us();
        
        /* Store measurement */
        timing_data[measurement_count].start_time_us = start;
        timing_data[measurement_count].end_time_us = end;
        timing_data[measurement_count].execution_time_us = end - start;
        timing_data[measurement_count].iteration = measurement_count;
        timing_data[measurement_count].deadline_met = 
            ((end - start) <= 15000); /* 15ms = 15000us */
        
        measurement_count++;
        
        PERIODIC_WAIT(&ret);
    }
    
    /* Analyze results */
    analyze_timing_measurements();
}

void analyze_timing_measurements(void)
{
    uint64_t min_exec = UINT64_MAX;
    uint64_t max_exec = 0;
    uint64_t sum_exec = 0;
    uint32_t deadline_violations = 0;
    
    for (uint32_t i = 0; i < NUM_MEASUREMENTS; i++)
    {
        uint64_t exec = timing_data[i].execution_time_us;
        
        if (exec < min_exec) min_exec = exec;
        if (exec > max_exec) max_exec = exec;
        sum_exec += exec;
        
        if (!timing_data[i].deadline_met)
        {
            deadline_violations++;
            log_error("Deadline miss at iteration %u: %llu us",
                     i, exec);
        }
    }
    
    uint64_t avg_exec = sum_exec / NUM_MEASUREMENTS;
    
    printf("\n========== Timing Analysis ==========\n");
    printf("Measurements:          %u\n", NUM_MEASUREMENTS);
    printf("Minimum Execution:     %llu us\n", min_exec);
    printf("Average Execution:     %llu us\n", avg_exec);
    printf("Maximum Execution:     %llu us\n", max_exec);
    printf("Deadline (Budget):     15000 us\n");
    printf("Worst-case Margin:     %lld us\n", 15000 - (int64_t)max_exec);
    printf("Deadline Violations:   %u (%.2f%%)\n", 
           deadline_violations,
           (deadline_violations * 100.0) / NUM_MEASUREMENTS);
    printf("====================================\n");
    
    /* DAL A requirement: Zero deadline violations */
    assert(deadline_violations == 0 && "Deadline violations detected!");
    assert(max_exec <= 15000 && "WCET exceeds budget!");
}
```

---

## 5. Hardware-in-the-Loop (HIL) Testing

### 5.1 HIL Test Bench Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   HIL Test Controller                    │
│  (Python/MATLAB Scripted Test Sequences)                │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────┐       ┌───────▼─────┐
│ Real HW    │       │ Simulation  │
│ ┌────────┐ │       │ Environment │
│ │NAI SBC │ │       │             │
│ │ + Deos │ │       │ • X-Plane   │
│ │ + Apps │ │       │ • Sensor    │
│ └────────┘ │       │   Models    │
│            │       │ • Actuator  │
│ 1553 │ 429│       │   Models    │
│  CAN │ ETH│       │ • Failures  │
└──────┴────┘       └─────────────┘
```

### 5.2 HIL Test Script Example (Python)

```python
#!/usr/bin/env python3
"""
HIL Test Script: Flight Control System
Scenario: Automated takeoff sequence with sensor failure injection
"""

import time
import struct
from dataclasses import dataclass
from typing import List
import mil1553  # MIL-STD-1553 interface library
import arinc429  # ARINC 429 interface library

@dataclass
class SensorData:
    """Flight sensor data structure"""
    airspeed: float  # knots
    altitude: float  # feet
    pitch: float     # degrees
    roll: float      # degrees
    yaw: float       # degrees
    timestamp_ms: int

@dataclass
class ControlOutput:
    """Control surface commands"""
    elevator: float  # degrees
    aileron: float   # degrees
    rudder: float    # degrees
    timestamp_ms: int

class HILTestBench:
    """Hardware-in-the-Loop Test Bench Controller"""
    
    def __init__(self, mil1553_device: str, arinc429_device: str):
        """Initialize HIL test bench"""
        self.mil1553 = mil1553.Interface(mil1553_device)
        self.arinc429 = arinc429.Interface(arinc429_device)
        self.test_results = []
        
    def send_sensor_data(self, sensor: SensorData):
        """Send sensor data to flight control system via ARINC 429"""
        
        # Encode airspeed (Label 206)
        airspeed_word = self.arinc429.encode_bnr(
            label=206,
            value=sensor.airspeed,
            resolution=1.0,
            ssm=arinc429.SSM_NORMAL_OPERATION
        )
        self.arinc429.transmit(airspeed_word)
        
        # Encode altitude (Label 203)
        altitude_word = self.arinc429.encode_bnr(
            label=203,
            value=sensor.altitude,
            resolution=1.0,
            ssm=arinc429.SSM_NORMAL_OPERATION
        )
        self.arinc429.transmit(altitude_word)
        
        # Encode attitude (pitch, roll via MIL-STD-1553)
        attitude_msg = struct.pack('<fff',
                                   sensor.pitch,
                                   sensor.roll,
                                   sensor.yaw)
        self.mil1553.send_message(
            rt_address=1,
            subaddress=5,
            data=attitude_msg
        )
        
    def read_control_output(self) -> ControlOutput:
        """Read control commands from flight control system"""
        
        # Read control surface commands via MIL-STD-1553
        response = self.mil1553.receive_message(
            rt_address=1,
            subaddress=10,
            timeout_ms=100
        )
        
        if response is None:
            raise TimeoutError("No control output received")
        
        # Unpack control commands
        elevator, aileron, rudder = struct.unpack('<fff', response.data)
        
        return ControlOutput(
            elevator=elevator,
            aileron=aileron,
            rudder=rudder,
            timestamp_ms=int(time.time() * 1000)
        )
    
    def run_takeoff_sequence(self):
        """
        Test Scenario: Automated takeoff with normal operation
        
        Requirements Tested:
          - SRS-FC-100: Takeoff rotation control
          - SRS-FC-101: Airspeed management
          - SRS-FC-102: Attitude stabilization
        """
        
        print("=== HIL Test: Takeoff Sequence ===")
        
        # Initial conditions
        sensor = SensorData(
            airspeed=0.0,
            altitude=0.0,
            pitch=0.0,
            roll=0.0,
            yaw=0.0,
            timestamp_ms=0
        )
        
        # Acceleration phase (0 to 150 knots)
        print("Phase 1: Acceleration")
        for t in range(0, 60, 1):  # 60 seconds
            sensor.airspeed = t * 2.5  # 2.5 knots/sec
            sensor.timestamp_ms = t * 1000
            
            self.send_sensor_data(sensor)
            time.sleep(0.02)  # 50 Hz update
            
            control = self.read_control_output()
            
            # Verify elevator stays neutral during ground roll
            assert -2.0 <= control.elevator <= 2.0, \
                f"Elevator deflection too large during ground roll: {control.elevator}°"
        
        # Rotation phase (Vr = 150 knots)
        print("Phase 2: Rotation")
        for t in range(60, 70, 1):  # 10 seconds
            sensor.airspeed = 150.0
            sensor.pitch = (t - 60) * 1.2  # 1.2°/sec pitch increase
            sensor.altitude = 0.0 if t < 62 else (t - 62) * 100  # Liftoff at t=62
            sensor.timestamp_ms = t * 1000
            
            self.send_sensor_data(sensor)
            time.sleep(0.02)
            
            control = self.read_control_output()
            
            # Verify nose-up elevator command during rotation
            if t >= 60:
                assert control.elevator > 0, \
                    f"Expected positive elevator during rotation, got {control.elevator}°"
        
        # Climb phase
        print("Phase 3: Initial Climb")
        for t in range(70, 100, 1):  # 30 seconds
            sensor.airspeed = 150.0 + (t - 70) * 0.5  # Accelerate to 165 knots
            sensor.pitch = 12.0  # Maintain climb pitch
            sensor.altitude += 200  # 200 fpm climb
            sensor.timestamp_ms = t * 1000
            
            self.send_sensor_data(sensor)
            time.sleep(0.02)
            
            control = self.read_control_output()
            
            # Verify pitch control maintains target
            assert 8.0 <= control.elevator <= 15.0, \
                f"Elevator out of range during climb: {control.elevator}°"
        
        print("✓ Takeoff sequence completed successfully")
    
    def run_sensor_failure_test(self):
        """
        Test Scenario: Airspeed sensor failure during flight
        
        Requirements Tested:
          - SRS-FC-200: Sensor failure detection
          - SRS-FC-201: Failure mode fallback
          - SRS-FC-202: Crew alerting
        """
        
        print("\n=== HIL Test: Sensor Failure Injection ===")
        
        # Cruise condition
        sensor = SensorData(
            airspeed=180.0,
            altitude=10000.0,
            pitch=2.0,
            roll=0.0,
            yaw=0.0,
            timestamp_ms=0
        )
        
        # Normal operation (10 seconds)
        print("Phase 1: Normal cruise")
        for t in range(0, 10, 1):
            sensor.timestamp_ms = t * 1000
            self.send_sensor_data(sensor)
            time.sleep(0.02)
            control = self.read_control_output()
        
        # Inject airspeed sensor failure
        print("Phase 2: Injecting airspeed sensor failure")
        for t in range(10, 20, 1):
            # Send invalid SSM (failure flag)
            airspeed_word = self.arinc429.encode_bnr(
                label=206,
                value=0.0,  # Invalid data
                resolution=1.0,
                ssm=arinc429.SSM_FAILURE_WARNING  # Failure flag
            )
            self.arinc429.transmit(airspeed_word)
            
            # Continue sending valid altitude & attitude
            altitude_word = self.arinc429.encode_bnr(
                label=203,
                value=sensor.altitude,
                resolution=1.0,
                ssm=arinc429.SSM_NORMAL_OPERATION
            )
            self.arinc429.transmit(altitude_word)
            
            time.sleep(0.02)
            control = self.read_control_output()
            
            # System should continue operating with last valid airspeed
            # Control outputs should remain stable
            assert -25.0 <= control.elevator <= 25.0, \
                "Excessive control deflection during sensor failure"
        
        # Check for fault annunciation via MIL-STD-1553
        fault_status = self.mil1553.receive_message(
            rt_address=1,
            subaddress=31,  # Fault status word
            timeout_ms=100
        )
        
        assert fault_status is not None, "No fault status reported"
        
        fault_word = struct.unpack('<I', fault_status.data)[0]
        airspeed_fault_bit = (fault_word >> 5) & 0x1
        
        assert airspeed_fault_bit == 1, \
            "Airspeed sensor failure not detected/reported"
        
        print("✓ Sensor failure detection and handling verified")
    
    def run_all_tests(self):
        """Execute complete HIL test suite"""
        try:
            self.run_takeoff_sequence()
            self.run_sensor_failure_test()
            print("\n" + "="*50)
            print("ALL HIL TESTS PASSED ✓")
            print("="*50)
            return True
        except AssertionError as e:
            print(f"\n✗ TEST FAILED: {e}")
            return False
        except Exception as e:
            print(f"\n✗ TEST ERROR: {e}")
            return False

if __name__ == "__main__":
    # Initialize HIL test bench
    hil = HILTestBench(
        mil1553_device="/dev/mil1553_0",
        arinc429_device="/dev/arinc429_0"
    )
    
    # Run tests
    success = hil.run_all_tests()
    exit(0 if success else 1)
```

---

## 6. WCET Analysis with Rapita RapiTime

### 6.1 RapiTime Configuration

**Project Setup:**
```bash
# Initialize RapiTime project
rapitime init --project FlightControl \
              --target powerpc-e6500 \
              --compiler powerpc-eabispe-gcc \
              --output wcet_analysis

# Configure target hardware model
rapitime config --hardware T2080 \
                --cache-config cache_model.xml \
                --clock-frequency 1800000000

# Add source files for analysis
rapitime source add partition/flight_control/src/*.c
```

### 6.2 Cache Model Configuration

**T2080_cache.xml:**
```xml
<?xml version="1.0"?>
<CacheModel>
  <Processor>PowerPC_e6500</Processor>
  <Core>
    <L1_Instruction>
      <Size>32768</Size> <!-- 32 KB -->
      <LineSize>64</LineSize>
      <Associativity>8</Associativity>
      <ReplacementPolicy>LRU</ReplacementPolicy>
    </L1_Instruction>
    <L1_Data>
      <Size>32768</Size> <!-- 32 KB -->
      <LineSize>64</LineSize>
      <Associativity>8</Associativity>
      <ReplacementPolicy>LRU</ReplacementPolicy>
    </L1_Data>
  </Core>
  <L2_Unified>
    <Size>2097152</Size> <!-- 2 MB -->
    <LineSize>64</LineSize>
    <Associativity>16</Associativity>
    <ReplacementPolicy>LRU</ReplacementPolicy>
  </L2_Unified>
</CacheModel>
```

### 6.3 WCET Analysis Execution

```bash
# Instrument code for timing analysis
rapitime instrument --optimization O2 \
                    --function flight_control_task \
                    --output instrumented/

# Build instrumented binary
cd instrumented && make

# Run on target hardware (or simulator)
rapitime trace --executable flight_control_inst.elf \
               --iterations 1000 \
               --output trace_data.rtd

# Analyze WCET
rapitime analyze --trace trace_data.rtd \
                 --function flight_control_task \
                 --confidence 95 \
                 --output wcet_report.html

# Generate certification evidence
rapitime report --format certification \
                --standard DO-178C \
                --output WCET_Evidence.pdf
```

**Sample WCET Report Output:**
```
================================================================
    RapiTime WCET Analysis Report
    DO-178C Certification Evidence
================================================================

Function: flight_control_task()
Target:   PowerPC e6500 @ 1.8 GHz
Date:     2026-03-20

WCET Results (95% Confidence):
  Observed Maximum:     14,248 μs
  Statistical WCET:     14,876 μs
  Safety Margin:        124 μs  (0.8%)
  Budget:              15,000 μs

Path Analysis:
  Critical Path Length: 2,847 instructions
  Cache Misses:         23 (L1I), 8 (L1D), 2 (L2)
  Branch Predictions:   142 taken, 18 not-taken

Certification Status: PASS ✓
  - WCET < Budget:      YES
  - Margin > 0:         YES
  - Confidence Level:   95%
  
Recommendation: APPROVED for DO-178C DAL A certification
================================================================
```

---

## 7. Test Traceability Matrix

### 7.1 Requirements to Test Mapping

```csv
Requirement ID,Requirement Text,Test Type,Test ID,Coverage,Status
SRS-FC-001,Initialize partition,Unit,UT-FC-001,Statement,PASS
SRS-FC-002,Create main task,Unit,UT-FC-002,MC/DC,PASS
SRS-FC-020,Execute control law,Unit,UT-FC-020-025,MC/DC,PASS
SRS-FC-030,Compute PID,Unit,UT-FC-030-035,MC/DC,PASS
SRS-FC-040,Verify limits,Unit,UT-FC-040,MC/DC,PASS
SRS-FC-050,Built-in test,Unit,UT-FC-050,Statement,PASS
SRS-FC-100,Takeoff control,HIL,HIL-FC-001,Functional,PASS
SRS-FC-101,Airspeed mgmt,HIL,HIL-FC-001,Functional,PASS
SRS-FC-200,Sensor failure,HIL,HIL-FC-002,Functional,PASS
SRS-FC-300,Inter-partition,Integration,IT-FC-001,Functional,PASS
```

### 7.2 Automated Traceability Generation

```python
#!/usr/bin/env python3
"""
Generate Requirements Traceability Matrix for DO-178C
"""

import csv
import re
from pathlib import Path
from typing import Dict, List, Set

def extract_requirements_from_code(source_file: Path) -> Set[str]:
    """Extract @requirement tags from source code"""
    requirements = set()
    
    with open(source_file, 'r') as f:
        for line in f:
            match = re.search(r'@requirement\s+([\w-]+)', line)
            if match:
                requirements.add(match.group(1))
    
    return requirements

def extract_requirements_from_tests(test_file: Path) -> Dict[str, List[str]]:
    """Extract TEST.REQUIREMENT_KEY from VectorCAST tests"""
    req_to_tests = {}
    
    with open(test_file, 'r') as f:
        current_test = None
        for line in f:
            if line.startswith('TEST.NAME:'):
                current_test = line.split(':')[1].strip()
            elif line.startswith('TEST.REQUIREMENT_KEY:'):
                req_id = line.split(':')[1].strip()
                if req_id not in req_to_tests:
                    req_to_tests[req_id] = []
                req_to_tests[req_id].append(current_test)
    
    return req_to_tests

def generate_traceability_matrix(
    requirements_csv: Path,
    source_dir: Path,
    test_dir: Path,
    output_html: Path
):
    """Generate HTML traceability matrix"""
    
    # Read requirements from CSV
    requirements = []
    with open(requirements_csv, 'r') as f:
        reader = csv.DictReader(f)
        requirements = list(reader)
    
    # Scan source code for implemented requirements
    implemented = set()
    for src_file in source_dir.glob('**/*.c'):
        implemented.update(extract_requirements_from_code(src_file))
    
    # Scan tests for verified requirements
    verified = {}
    for test_file in test_dir.glob('**/*.tst'):
        verified.update(extract_requirements_from_tests(test_file))
    
    # Generate HTML report
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Requirements Traceability Matrix</title>
        <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .pass { color: green; font-weight: bold; }
            .fail { color: red; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>DO-178C Requirements Traceability Matrix</h1>
        <table>
            <tr>
                <th>Req ID</th>
                <th>Description</th>
                <th>Implemented</th>
                <th>Tested</th>
                <th>Test Cases</th>
                <th>Status</th>
            </tr>
    """
    
    for req in requirements:
        req_id = req['ID']
        is_impl = req_id in implemented
        is_tested = req_id in verified
        test_cases = ', '.join(verified.get(req_id, []))
        
        status = "PASS" if (is_impl and is_tested) else "FAIL"
        status_class = "pass" if status == "PASS" else "fail"
        
        html += f"""
            <tr>
                <td>{req_id}</td>
                <td>{req['Description']}</td>
                <td>{'✓' if is_impl else '✗'}</td>
                <td>{'✓' if is_tested else '✗'}</td>
                <td>{test_cases}</td>
                <td class="{status_class}">{status}</td>
            </tr>
        """
    
    html += """
        </table>
    </body>
    </html>
    """
    
    with open(output_html, 'w') as f:
        f.write(html)
    
    print(f"Traceability matrix generated: {output_html}")

if __name__ == "__main__":
    generate_traceability_matrix(
        requirements_csv=Path("requirements/requirements.csv"),
        source_dir=Path("partition/flight_control/src"),
        test_dir=Path("tests/unit"),
        output_html=Path("traceability_matrix.html")
    )
```

---

## 8. Certification Evidence Package

### 8.1 Required Test Documentation

**For each test case, provide:**
1. **Test Procedure:** Step-by-step execution instructions
2. **Test Data:** Input values, expected outputs
3. **Test Results:** Actual outputs, pass/fail status
4. **Coverage Data:** Statement, branch, MC/DC metrics
5. **Traceability:** Link to requirements

**Example Test Procedure Document:**

```markdown
# Test Procedure: TP-FC-030
## PID Controller Unit Test

### Objective
Verify PID controller computes correct output for given inputs
and meets MC/DC coverage requirements.

### Requirements Tested
- SRS-FC-030: PID algorithm implementation
- SRS-FC-031: Proportional term
- SRS-FC-032: Integral term with anti-windup
- SRS-FC-033: Derivative term

### Test Environment
- Target: NAI 68PPC2 development board
- RTOS: Deos v5.1
- Tool: VectorCAST v24.sp1
- Compiler: GCC PowerPC v12.2.0

### Preconditions
1. VectorCAST environment created
2. Source code compiled with debug symbols
3. Coverage instrumentation enabled

### Test Steps

1. **Execute Test Suite**
   ```bash
   vcast -e FlightControl.env execute batch
   ```

2. **Verify Test Results**
   - All tests must PASS
   - No assertion failures
   
3. **Check Coverage**
   ```bash
   vcast -e FlightControl.env coverage verify MC_DC 100
   ```
   
   Expected: 100% MC/DC coverage

### Expected Results
- Test UT-FC-030: PASS (proportional term)
- Test UT-FC-031: PASS (integral with windup)
- Test UT-FC-032: PASS (derivative term)
- Test UT-FC-033: PASS (negative error)
- Coverage: 100% MC/DC

### Actual Results
[To be filled during test execution]

### Discrepancies
[None expected - document any failures]

### Approval
Tester: ________________  Date: __________
Reviewer: ______________  Date: __________
```

---

## Summary

This testing guide provides comprehensive coverage of DO-178C DAL A verification requirements:

✅ **MC/DC Coverage** - Theory, examples, and automated generation  
✅ **Unit Testing** - VectorCAST integration with examples  
✅ **Integration Testing** - ARINC 653 communication verification  
✅ **HIL Testing** - Complete Python framework for hardware tests  
✅ **WCET Analysis** - Rapita RapiTime configuration and execution  
✅ **Traceability** - Automated matrix generation  
✅ **Documentation** - Test procedures and evidence packages  

All test strategies are designed to meet certification authority requirements and provide auditable evidence for DO-178C compliance.
