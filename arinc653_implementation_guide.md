# ARINC 653 Implementation Guide
## Practical Code Examples for DO-178C DAL A Certification

---

## 1. ARINC 653 Module Configuration

### 1.1 Complete Module Configuration XML

This is the core configuration file that defines your IMA platform's partitioning scheme, scheduling, memory allocation, and inter-partition communication.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- DO-178C DAL A - Flight Control Module Configuration -->
<!-- Configuration Management: FCM-CONFIG-v1.0.0 -->
<!-- Certification: Type Certificate TC-12345 -->

<Module_Configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  
  <!-- Module Identification -->
  <Module_Name>FlightControlModule</Module_Name>
  <Module_Version>1.0.0</Module_Version>
  <Module_Id>FCM-001</Module_Id>
  
  <!-- Hardware Platform -->
  <Platform>
    <Processor_Type>PowerPC_e6500</Processor_Type>
    <Core_Count>4</Core_Count>
    <Clock_Frequency>1800000000</Clock_Frequency> <!-- 1.8 GHz -->
    <Memory_Size>4294967296</Memory_Size> <!-- 4 GB -->
  </Platform>
  
  <!-- =============================================== -->
  <!-- PARTITION DEFINITIONS                           -->
  <!-- =============================================== -->
  
  <Partition_Table>
    
    <!-- Partition 1: Flight Control (DAL A) -->
    <Partition>
      <Identifier>1</Identifier>
      <Name>FlightControl</Name>
      <Criticality>LEVEL_A</Criticality>
      <Entry_Point>flight_control_main</Entry_Point>
      
      <!-- Memory Configuration -->
      <Memory_Requirements>
        <Region Type="CODE">
          <Base_Address>0x20000000</Base_Address>
          <Size>0x00200000</Size> <!-- 2 MB code -->
          <Access>READ_EXECUTE</Access>
        </Region>
        <Region Type="DATA">
          <Base_Address>0x40000000</Base_Address>
          <Size>0x20000000</Size> <!-- 512 MB data -->
          <Access>READ_WRITE</Access>
        </Region>
        <Region Type="STACK">
          <Size>0x00100000</Size> <!-- 1 MB stack -->
        </Region>
        <Region Type="HEAP">
          <Size>0x01000000</Size> <!-- 16 MB heap -->
        </Region>
      </Memory_Requirements>
      
      <!-- Processor Affinity -->
      <Core_Affinity>0</Core_Affinity>
      
      <!-- Health Monitor Configuration -->
      <Health_Monitor>
        <Enable>true</Enable>
        <Watchdog_Timeout>100</Watchdog_Timeout> <!-- ms -->
        <Deadline_Monitoring>true</Deadline_Monitoring>
      </Health_Monitor>
    </Partition>
    
    <!-- Partition 2: Navigation (DAL B) -->
    <Partition>
      <Identifier>2</Identifier>
      <Name>Navigation</Name>
      <Criticality>LEVEL_B</Criticality>
      <Entry_Point>navigation_main</Entry_Point>
      
      <Memory_Requirements>
        <Region Type="CODE">
          <Base_Address>0x30000000</Base_Address>
          <Size>0x00180000</Size> <!-- 1.5 MB code -->
          <Access>READ_EXECUTE</Access>
        </Region>
        <Region Type="DATA">
          <Base_Address>0x60000000</Base_Address>
          <Size>0x10000000</Size> <!-- 256 MB data -->
          <Access>READ_WRITE</Access>
        </Region>
      </Memory_Requirements>
      
      <Core_Affinity>1</Core_Affinity>
      
      <Health_Monitor>
        <Enable>true</Enable>
        <Watchdog_Timeout>200</Watchdog_Timeout>
      </Health_Monitor>
    </Partition>
    
    <!-- Partition 3: Communications (DAL C) -->
    <Partition>
      <Identifier>3</Identifier>
      <Name>Communications</Name>
      <Criticality>LEVEL_C</Criticality>
      <Entry_Point>comms_main</Entry_Point>
      
      <Memory_Requirements>
        <Region Type="CODE">
          <Base_Address>0x38000000</Base_Address>
          <Size>0x00180000</Size>
          <Access>READ_EXECUTE</Access>
        </Region>
        <Region Type="DATA">
          <Base_Address>0x70000000</Base_Address>
          <Size>0x10000000</Size> <!-- 256 MB data -->
          <Access>READ_WRITE</Access>
        </Region>
      </Memory_Requirements>
      
      <Core_Affinity>2</Core_Affinity>
    </Partition>
    
    <!-- Partition 4: Health Monitor (DAL A) -->
    <Partition>
      <Identifier>4</Identifier>
      <Name>HealthMonitor</Name>
      <Criticality>LEVEL_A</Criticality>
      <Entry_Point>health_monitor_main</Entry_Point>
      
      <Memory_Requirements>
        <Region Type="CODE">
          <Base_Address>0x28000000</Base_Address>
          <Size>0x00100000</Size> <!-- 1 MB code -->
          <Access>READ_EXECUTE</Access>
        </Region>
        <Region Type="DATA">
          <Base_Address>0x80000000</Base_Address>
          <Size>0x08000000</Size> <!-- 128 MB data -->
          <Access>READ_WRITE</Access>
        </Region>
      </Memory_Requirements>
      
      <Core_Affinity>2</Core_Affinity>
      
      <Health_Monitor>
        <Enable>true</Enable>
        <Watchdog_Timeout>50</Watchdog_Timeout>
      </Health_Monitor>
    </Partition>
    
  </Partition_Table>
  
  <!-- =============================================== -->
  <!-- SCHEDULING CONFIGURATION                        -->
  <!-- =============================================== -->
  
  <Module_Schedule>
    <Major_Frame Duration="100" Unit="Millisecond"/>
    
    <Partition_Schedule>
      <!-- Window 1: Flight Control (Core 0) -->
      <Window>
        <Partition_Id>1</Partition_Id>
        <Partition_Name>FlightControl</Partition_Name>
        <Duration>15</Duration> <!-- ms -->
        <Offset>0</Offset>
        <Periodic>true</Periodic>
        <Period_Duration>50</Period_Duration>
      </Window>
      
      <!-- Window 2: Navigation (Core 1) -->
      <Window>
        <Partition_Id>2</Partition_Id>
        <Partition_Name>Navigation</Partition_Name>
        <Duration>20</Duration>
        <Offset>15</Offset>
        <Periodic>true</Periodic>
        <Period_Duration>100</Period_Duration>
      </Window>
      
      <!-- Window 3: Communications (Core 2) -->
      <Window>
        <Partition_Id>3</Partition_Id>
        <Partition_Name>Communications</Partition_Name>
        <Duration>10</Duration>
        <Offset>35</Offset>
        <Periodic>true</Periodic>
        <Period_Duration>100</Period_Duration>
      </Window>
      
      <!-- Window 4: Health Monitor (Core 2) -->
      <Window>
        <Partition_Id>4</Partition_Id>
        <Partition_Name>HealthMonitor</Partition_Name>
        <Duration>5</Duration>
        <Offset>45</Offset>
        <Periodic>true</Periodic>
        <Period_Duration>100</Period_Duration>
      </Window>
      
      <!-- Window 5: Flight Control Second Window (50 Hz) -->
      <Window>
        <Partition_Id>1</Partition_Id>
        <Partition_Name>FlightControl</Partition_Name>
        <Duration>15</Duration>
        <Offset>50</Offset>
        <Periodic>true</Periodic>
        <Period_Duration>50</Period_Duration>
      </Window>
    </Partition_Schedule>
  </Module_Schedule>
  
  <!-- =============================================== -->
  <!-- INTER-PARTITION COMMUNICATION                   -->
  <!-- =============================================== -->
  
  <Connection_Table>
    
    <!-- Sampling Port: Flight Control → Navigation -->
    <Sampling_Port>
      <Name>FC_to_NAV_Position</Name>
      <Max_Message_Size>128</Max_Message_Size>
      <Direction>SOURCE</Direction>
      <Source_Partition>FlightControl</Source_Partition>
      <Destination_Partition>Navigation</Destination_Partition>
      <Refresh_Period>50</Refresh_Period> <!-- ms -->
    </Sampling_Port>
    
    <!-- Queuing Port: Navigation → Flight Control -->
    <Queuing_Port>
      <Name>NAV_to_FC_Waypoint</Name>
      <Max_Message_Size>256</Max_Message_Size>
      <Max_Nb_Message>8</Max_Nb_Message>
      <Direction>SOURCE</Direction>
      <Source_Partition>Navigation</Source_Partition>
      <Destination_Partition>FlightControl</Destination_Partition>
      <Queue_Discipline>FIFO</Queue_Discipline>
    </Queuing_Port>
    
    <!-- Sampling Port: Health Monitor → All Partitions (Broadcast) -->
    <Sampling_Port>
      <Name>Health_Status_Broadcast</Name>
      <Max_Message_Size>64</Max_Message_Size>
      <Direction>SOURCE</Direction>
      <Source_Partition>HealthMonitor</Source_Partition>
      <Destination_Partition>FlightControl</Destination_Partition>
      <Destination_Partition>Navigation</Destination_Partition>
      <Destination_Partition>Communications</Destination_Partition>
      <Refresh_Period>100</Refresh_Period>
    </Sampling_Port>
    
    <!-- Queuing Port: Flight Control → Communications (Telemetry) -->
    <Queuing_Port>
      <Name>FC_Telemetry</Name>
      <Max_Message_Size>512</Max_Message_Size>
      <Max_Nb_Message>16</Max_Nb_Message>
      <Direction>SOURCE</Direction>
      <Source_Partition>FlightControl</Source_Partition>
      <Destination_Partition>Communications</Destination_Partition>
    </Queuing_Port>
    
  </Connection_Table>
  
  <!-- =============================================== -->
  <!-- HARDWARE RESOURCES                              -->
  <!-- =============================================== -->
  
  <Hardware_Resources>
    
    <!-- MIL-STD-1553 Bus -->
    <Device>
      <Name>MIL1553_BusController</Name>
      <Type>MIL_STD_1553</Type>
      <Base_Address>0xE0000000</Base_Address>
      <Interrupt>32</Interrupt>
      <Partition_Access>
        <Partition_Name>FlightControl</Partition_Name>
        <Access_Mode>READ_WRITE</Access_Mode>
      </Partition_Access>
      <Partition_Access>
        <Partition_Name>HealthMonitor</Partition_Name>
        <Access_Mode>READ_ONLY</Access_Mode>
      </Partition_Access>
    </Device>
    
    <!-- ARINC 429 -->
    <Device>
      <Name>ARINC429_Channel_1</Name>
      <Type>ARINC_429</Type>
      <Base_Address>0xE1000000</Base_Address>
      <Interrupt>33</Interrupt>
      <Partition_Access>
        <Partition_Name>Navigation</Partition_Name>
        <Access_Mode>READ_WRITE</Access_Mode>
      </Partition_Access>
    </Device>
    
    <!-- CAN Bus -->
    <Device>
      <Name>CAN_Bus_Sensors</Name>
      <Type>CAN</Type>
      <Base_Address>0xE2000000</Base_Address>
      <Interrupt>34</Interrupt>
      <Partition_Access>
        <Partition_Name>FlightControl</Partition_Name>
        <Access_Mode>READ_WRITE</Access_Mode>
      </Partition_Access>
      <Partition_Access>
        <Partition_Name>HealthMonitor</Partition_Name>
        <Access_Mode>READ_ONLY</Access_Mode>
      </Partition_Access>
    </Device>
    
  </Hardware_Resources>
  
  <!-- =============================================== -->
  <!-- ERROR HANDLING                                  -->
  <!-- =============================================== -->
  
  <Error_Handling>
    <Module_Level_Error_Handler>module_error_handler</Module_Level_Error_Handler>
    
    <Error_Action Type="DEADLINE_MISSED">
      <Action>LOG_AND_NOTIFY</Action>
      <Recovery>PARTITION_RESTART</Recovery>
    </Error_Action>
    
    <Error_Action Type="APPLICATION_ERROR">
      <Action>LOG_AND_NOTIFY</Action>
      <Recovery>PARTITION_RESTART</Recovery>
      <Max_Restart_Count>3</Max_Restart_Count>
    </Error_Action>
    
    <Error_Action Type="PARTITION_FAULT">
      <Action>LOG_AND_ISOLATE</Action>
      <Recovery>PARTITION_RESTART</Recovery>
      <Max_Restart_Count>3</Max_Restart_Count>
      <Escalation>MODULE_HALT</Escalation>
    </Error_Action>
    
    <Error_Action Type="MEMORY_VIOLATION">
      <Action>IMMEDIATE_HALT</Action>
      <Recovery>PARTITION_RESTART</Recovery>
      <Notify_Crew>true</Notify_Crew>
    </Error_Action>
  </Error_Handling>
  
</Module_Configuration>
```

---

## 2. Flight Control Partition Implementation

### 2.1 Partition Main Entry Point

```c
/**
 * @file flight_control_main.c
 * @brief Flight Control partition main entry point
 * @compliance DO-178C DAL A
 * @requirement SRS-FC-001, SRS-FC-002
 * @safety_analysis PSSA-FC-001
 * @partition FlightControl
 * @version 1.0.0
 * @date 2026-03-20
 */

#include <arinc653/apex.h>
#include <arinc653/sampling.h>
#include <arinc653/queuing.h>
#include "flight_control.h"
#include "health_monitor_iface.h"
#include "sensor_processing.h"
#include "control_law.h"

/* ============================================= */
/* GLOBAL CONSTANTS                              */
/* ============================================= */

#define FC_TASK_PRIORITY        (100)
#define FC_TASK_STACK_SIZE      (32768)
#define FC_TASK_PERIOD_MS       (20)    /* 50 Hz */
#define FC_TASK_DEADLINE_MS     (15)
#define SENSOR_TIMEOUT_MS       (100)
#define MAX_CONTROL_FAILURES    (3)

/* ============================================= */
/* PARTITION-LEVEL VARIABLES                     */
/* ============================================= */

static PROCESS_ID_TYPE fc_task_id;
static PROCESS_ID_TYPE bist_task_id;

static health_status_t partition_health;
static uint32_t control_failure_count = 0;

/* ARINC 653 Port Handles */
static SAMPLING_PORT_ID_TYPE position_out_port;
static QUEUING_PORT_ID_TYPE waypoint_in_port;
static SAMPLING_PORT_ID_TYPE health_in_port;
static QUEUING_PORT_ID_TYPE telemetry_out_port;

/* ============================================= */
/* FUNCTION PROTOTYPES                           */
/* ============================================= */

static void flight_control_task(void);
static void built_in_self_test_task(void);
static void initialize_ports(void);
static void error_handler(PROCESS_ID_TYPE process_id, ERROR_CODE_TYPE error_code);

/**
 * @brief Partition main entry point
 * @requirement SRS-FC-001: Initialize flight control partition
 */
void flight_control_main(void)
{
    RETURN_CODE_TYPE ret;
    PROCESS_ATTRIBUTE_TYPE fc_task_attr;
    PROCESS_ATTRIBUTE_TYPE bist_task_attr;
    
    /* ============================================= */
    /* PARTITION INITIALIZATION                      */
    /* ============================================= */
    
    /* Initialize health status */
    partition_health.state = PARTITION_HEALTHY;
    partition_health.error_count = 0;
    partition_health.last_bist_result = BIST_NOT_RUN;
    
    /* Initialize ARINC 653 communication ports */
    initialize_ports();
    
    /* ============================================= */
    /* CREATE FLIGHT CONTROL TASK                    */
    /* ============================================= */
    
    /* Configure flight control task attributes */
    strncpy(fc_task_attr.NAME, "FC_Control", MAX_NAME_LENGTH);
    fc_task_attr.ENTRY_POINT = (SYSTEM_ADDRESS_TYPE)flight_control_task;
    fc_task_attr.STACK_SIZE = FC_TASK_STACK_SIZE;
    fc_task_attr.BASE_PRIORITY = FC_TASK_PRIORITY;
    fc_task_attr.PERIOD = MILLISECONDS_TO_TICKS(FC_TASK_PERIOD_MS);
    fc_task_attr.TIME_CAPACITY = MILLISECONDS_TO_TICKS(FC_TASK_DEADLINE_MS);
    fc_task_attr.DEADLINE = SOFT;
    
    CREATE_PROCESS(&fc_task_attr, &fc_task_id, &ret);
    
    if (ret != NO_ERROR)
    {
        /* Critical error - cannot proceed */
        RAISE_APPLICATION_ERROR(APPLICATION_ERROR, "Failed to create FC task", &ret);
        return;
    }
    
    /* ============================================= */
    /* CREATE BUILT-IN SELF-TEST TASK                */
    /* ============================================= */
    
    strncpy(bist_task_attr.NAME, "FC_BIST", MAX_NAME_LENGTH);
    bist_task_attr.ENTRY_POINT = (SYSTEM_ADDRESS_TYPE)built_in_self_test_task;
    bist_task_attr.STACK_SIZE = 16384;
    bist_task_attr.BASE_PRIORITY = FC_TASK_PRIORITY - 10; /* Lower priority */
    bist_task_attr.PERIOD = MILLISECONDS_TO_TICKS(1000); /* 1 Hz */
    bist_task_attr.TIME_CAPACITY = MILLISECONDS_TO_TICKS(50);
    bist_task_attr.DEADLINE = SOFT;
    
    CREATE_PROCESS(&bist_task_attr, &bist_task_id, &ret);
    
    if (ret != NO_ERROR)
    {
        /* BIST task is not critical - log but continue */
        log_warning("BIST task creation failed");
    }
    
    /* ============================================= */
    /* START PARTITION SCHEDULING                    */
    /* ============================================= */
    
    START(fc_task_id, &ret);
    if (ret == NO_ERROR && bist_task_id != INVALID_PROCESS_ID)
    {
        START(bist_task_id, &ret);
    }
    
    /* Set partition mode to NORMAL - begins periodic scheduling */
    SET_PARTITION_MODE(NORMAL, &ret);
    
    if (ret != NO_ERROR)
    {
        RAISE_APPLICATION_ERROR(APPLICATION_ERROR, "Partition mode transition failed", &ret);
    }
    
    /* Should never return from SET_PARTITION_MODE */
    while (1)
    {
        /* Infinite loop in case of error */
    }
}

/**
 * @brief Initialize ARINC 653 communication ports
 * @requirement SRS-FC-010: Inter-partition communication setup
 */
static void initialize_ports(void)
{
    RETURN_CODE_TYPE ret;
    
    /* ============================================= */
    /* SAMPLING PORT: Position Output to Navigation */
    /* ============================================= */
    
    CREATE_SAMPLING_PORT(
        "FC_to_NAV_Position",           /* Port name */
        sizeof(position_data_t),        /* Max message size */
        SOURCE,                         /* Direction */
        MILLISECONDS_TO_TICKS(50),      /* Refresh period */
        &position_out_port,
        &ret
    );
    
    if (ret != NO_ERROR)
    {
        log_error("Failed to create position output port");
    }
    
    /* ============================================= */
    /* QUEUING PORT: Waypoint Input from Navigation */
    /* ============================================= */
    
    CREATE_QUEUING_PORT(
        "NAV_to_FC_Waypoint",           /* Port name */
        sizeof(waypoint_data_t),        /* Max message size */
        8,                              /* Max number of messages */
        DESTINATION,                    /* Direction */
        FIFO,                          /* Queue discipline */
        &waypoint_in_port,
        &ret
    );
    
    if (ret != NO_ERROR)
    {
        log_error("Failed to create waypoint input port");
    }
    
    /* ============================================= */
    /* SAMPLING PORT: Health Status Input           */
    /* ============================================= */
    
    CREATE_SAMPLING_PORT(
        "Health_Status_Broadcast",
        sizeof(health_status_t),
        DESTINATION,
        MILLISECONDS_TO_TICKS(100),
        &health_in_port,
        &ret
    );
    
    /* ============================================= */
    /* QUEUING PORT: Telemetry Output               */
    /* ============================================= */
    
    CREATE_QUEUING_PORT(
        "FC_Telemetry",
        sizeof(telemetry_packet_t),
        16,
        SOURCE,
        FIFO,
        &telemetry_out_port,
        &ret
    );
}

/**
 * @brief Main flight control task - periodic execution at 50 Hz
 * @requirement SRS-FC-020: Flight control law execution
 * @verification SVCP-FC-020
 */
static void flight_control_task(void)
{
    RETURN_CODE_TYPE ret;
    sensor_data_t sensor_input;
    control_output_t control_cmd;
    position_data_t position_output;
    waypoint_data_t waypoint;
    telemetry_packet_t telemetry;
    MESSAGE_SIZE_TYPE msg_size;
    VALIDITY_TYPE validity;
    
    /* Task initialization */
    memset(&sensor_input, 0, sizeof(sensor_input));
    memset(&control_cmd, 0, sizeof(control_cmd));
    
    /* ============================================= */
    /* PERIODIC TASK LOOP - 50 Hz                    */
    /* ============================================= */
    
    while (1)
    {
        /* ========================================= */
        /* PHASE 1: READ SENSOR DATA                 */
        /* ========================================= */
        
        ret = read_sensor_data(&sensor_input, SENSOR_TIMEOUT_MS);
        
        if (ret != NO_ERROR)
        {
            /* Sensor read failure - increment error counter */
            control_failure_count++;
            
            if (control_failure_count >= MAX_CONTROL_FAILURES)
            {
                /* Critical failure - raise application error */
                RAISE_APPLICATION_ERROR(
                    DEADLINE_MISSED,
                    "Sensor read timeout exceeded threshold",
                    &ret
                );
            }
            
            /* Use last known good sensor data (stored internally) */
            sensor_input = get_last_valid_sensor_data();
        }
        else
        {
            /* Reset failure counter on successful read */
            control_failure_count = 0;
        }
        
        /* ========================================= */
        /* PHASE 2: READ WAYPOINT (Non-blocking)     */
        /* ========================================= */
        
        RECEIVE_QUEUING_MESSAGE(
            waypoint_in_port,
            MILLISECONDS_TO_TICKS(0), /* Non-blocking */
            (MESSAGE_ADDR_TYPE)&waypoint,
            &msg_size,
            &ret
        );
        
        if (ret == NO_ERROR && msg_size == sizeof(waypoint_data_t))
        {
            /* Update active waypoint */
            update_target_waypoint(&waypoint);
        }
        /* No action if queue is empty - continue with current waypoint */
        
        /* ========================================= */
        /* PHASE 3: EXECUTE CONTROL LAW              */
        /* ========================================= */
        
        /**
         * @requirement SRS-FC-030: Control law computation
         * @algorithm PID control with feedforward compensation
         */
        compute_control_law(&sensor_input, &control_cmd);
        
        /* ========================================= */
        /* PHASE 4: VERIFY CONTROL OUTPUT            */
        /* ========================================= */
        
        /**
         * @requirement SRS-FC-040: Control output range verification
         * @safety_critical Prevents actuator saturation
         */
        if (!verify_control_limits(&control_cmd))
        {
            /* Control output exceeds safe limits - apply saturation */
            apply_control_saturation(&control_cmd);
            
            /* Log safety event */
            log_safety_event("Control saturation applied", &control_cmd);
        }
        
        /* ========================================= */
        /* PHASE 5: WRITE CONTROL COMMANDS           */
        /* ========================================= */
        
        ret = write_control_output(&control_cmd);
        
        if (ret != NO_ERROR)
        {
            /* Actuator write failure - critical error */
            RAISE_APPLICATION_ERROR(
                APPLICATION_ERROR,
                "Control output write failed",
                &ret
            );
        }
        
        /* ========================================= */
        /* PHASE 6: PUBLISH POSITION DATA            */
        /* ========================================= */
        
        /* Compute current position from sensor fusion */
        compute_position(&sensor_input, &position_output);
        
        WRITE_SAMPLING_MESSAGE(
            position_out_port,
            (MESSAGE_ADDR_TYPE)&position_output,
            sizeof(position_data_t),
            &ret
        );
        
        /* ========================================= */
        /* PHASE 7: SEND TELEMETRY                   */
        /* ========================================= */
        
        /* Package telemetry data */
        telemetry.timestamp = get_system_time_ms();
        telemetry.sensor_data = sensor_input;
        telemetry.control_output = control_cmd;
        telemetry.health_status = partition_health.state;
        
        SEND_QUEUING_MESSAGE(
            telemetry_out_port,
            (MESSAGE_ADDR_TYPE)&telemetry,
            sizeof(telemetry_packet_t),
            MILLISECONDS_TO_TICKS(0), /* Non-blocking */
            &ret
        );
        
        /* If queue full, oldest message is dropped - acceptable for telemetry */
        
        /* ========================================= */
        /* PHASE 8: CHECK HEALTH STATUS              */
        /* ========================================= */
        
        READ_SAMPLING_MESSAGE(
            health_in_port,
            (MESSAGE_ADDR_TYPE)&partition_health,
            &msg_size,
            &validity,
            &ret
        );
        
        if (validity == VALID && partition_health.state == PARTITION_DEGRADED)
        {
            /* Health monitor reports degraded mode - reduce control authority */
            apply_degraded_mode_limits(&control_cmd);
        }
        
        /* ========================================= */
        /* WAIT FOR NEXT PERIOD                      */
        /* ========================================= */
        
        PERIODIC_WAIT(&ret);
        
        if (ret != NO_ERROR)
        {
            /* Periodic wait failure indicates scheduling error */
            RAISE_APPLICATION_ERROR(
                DEADLINE_MISSED,
                "Periodic wait failed - schedule violation",
                &ret
            );
        }
    }
}

/**
 * @brief Built-in self-test task - executes at 1 Hz
 * @requirement SRS-FC-050: Continuous health monitoring
 */
static void built_in_self_test_task(void)
{
    RETURN_CODE_TYPE ret;
    bist_result_t bist_result;
    
    while (1)
    {
        /* ========================================= */
        /* MEMORY INTEGRITY CHECK                    */
        /* ========================================= */
        
        bist_result.memory_check = verify_memory_integrity();
        
        /* ========================================= */
        /* SENSOR INTERFACE HEALTH                   */
        /* ========================================= */
        
        bist_result.sensor_health = test_sensor_interface();
        
        /* ========================================= */
        /* ACTUATOR INTERFACE HEALTH                 */
        /* ========================================= */
        
        bist_result.actuator_health = test_actuator_interface();
        
        /* ========================================= */
        /* CONTROL LAW SANITY CHECK                  */
        /* ========================================= */
        
        bist_result.algorithm_check = verify_control_algorithm();
        
        /* ========================================= */
        /* UPDATE PARTITION HEALTH                   */
        /* ========================================= */
        
        if (bist_result.memory_check == BIST_FAIL ||
            bist_result.sensor_health == BIST_FAIL ||
            bist_result.actuator_health == BIST_FAIL)
        {
            partition_health.state = PARTITION_FAILED;
            partition_health.last_bist_result = BIST_FAIL;
            
            /* Notify health monitor partition */
            notify_health_monitor_failure(&bist_result);
        }
        else if (bist_result.algorithm_check == BIST_DEGRADED)
        {
            partition_health.state = PARTITION_DEGRADED;
        }
        else
        {
            partition_health.state = PARTITION_HEALTHY;
            partition_health.last_bist_result = BIST_PASS;
        }
        
        PERIODIC_WAIT(&ret);
    }
}

/**
 * @brief Partition-level error handler
 * @requirement SRS-FC-060: Error handling and recovery
 */
static void error_handler(PROCESS_ID_TYPE process_id, ERROR_CODE_TYPE error_code)
{
    error_log_entry_t error_log;
    RETURN_CODE_TYPE ret;
    
    /* Log error details */
    error_log.timestamp = get_system_time_ms();
    error_log.process_id = process_id;
    error_log.error_code = error_code;
    error_log.partition_state = partition_health.state;
    
    /* Write to non-volatile error log */
    write_error_log(&error_log);
    
    /* Notify crew via display system */
    if (error_code == DEADLINE_MISSED || error_code == APPLICATION_ERROR)
    {
        notify_crew_caution_message("FLT CTRL FAULT");
    }
    
    /* Attempt recovery based on error type */
    switch (error_code)
    {
        case DEADLINE_MISSED:
            /* Reset failure counter and continue */
            control_failure_count = 0;
            break;
            
        case APPLICATION_ERROR:
            /* Restart the failed process */
            STOP(process_id, &ret);
            START(process_id, &ret);
            break;
            
        case MEMORY_VIOLATION:
            /* Critical error - halt partition and notify health monitor */
            partition_health.state = PARTITION_FAILED;
            SET_PARTITION_MODE(IDLE, &ret);
            break;
            
        default:
            /* Unknown error - halt partition */
            SET_PARTITION_MODE(IDLE, &ret);
            break;
    }
}
```

---

## 3. Control Law Implementation (DAL A)

### 3.1 PID Controller with Feedforward

```c
/**
 * @file control_law.c
 * @brief Flight control law implementation
 * @compliance DO-178C DAL A
 * @requirement SRS-FC-030
 * @algorithm PID with feedforward compensation
 * @version 1.0.0
 */

#include "control_law.h"
#include "sensor_processing.h"
#include <math.h>
#include <string.h>

/* ============================================= */
/* CONTROL LAW CONSTANTS                         */
/* ============================================= */

/* PID Gains - Pitch Channel */
#define KP_PITCH            (2.5f)
#define KI_PITCH            (0.8f)
#define KD_PITCH            (0.3f)

/* PID Gains - Roll Channel */
#define KP_ROLL             (3.0f)
#define KI_ROLL             (1.0f)
#define KD_ROLL             (0.4f)

/* PID Gains - Yaw Channel */
#define KP_YAW              (1.8f)
#define KI_YAW              (0.5f)
#define KD_YAW              (0.2f)

/* Integrator Anti-Windup Limits */
#define MAX_INTEGRAL_PITCH  (10.0f)
#define MAX_INTEGRAL_ROLL   (10.0f)
#define MAX_INTEGRAL_YAW    (8.0f)

/* Control Surface Limits (degrees) */
#define MAX_ELEVATOR        (25.0f)
#define MAX_AILERON         (30.0f)
#define MAX_RUDDER          (20.0f)

/* Sample Time */
#define DT                  (0.020f)    /* 20 ms = 50 Hz */

/* ============================================= */
/* STATE VARIABLES                               */
/* ============================================= */

typedef struct {
    float integral_pitch;
    float integral_roll;
    float integral_yaw;
    float prev_error_pitch;
    float prev_error_roll;
    float prev_error_yaw;
    uint32_t iteration_count;
} control_state_t;

static control_state_t control_state = {0};

/* ============================================= */
/* STATIC FUNCTION PROTOTYPES                    */
/* ============================================= */

static float clamp(float value, float min, float max);
static float compute_pid(float error, float* integral, float* prev_error,
                         float kp, float ki, float kd, float max_integral);

/**
 * @brief Main control law computation
 * @param[in] sensor Sensor input data
 * @param[out] control Control output commands
 * @requirement SRS-FC-030: Compute control law
 * @verification SVCP-FC-030
 */
void compute_control_law(const sensor_data_t* sensor, control_output_t* control)
{
    float pitch_error, roll_error, yaw_error;
    float pitch_cmd, roll_cmd, yaw_cmd;
    
    /* Input validation */
    if (sensor == NULL || control == NULL)
    {
        /* Defensive programming - should never occur in certified code */
        return;
    }
    
    /* ============================================= */
    /* COMPUTE ATTITUDE ERRORS                       */
    /* ============================================= */
    
    /**
     * @requirement SRS-FC-031: Attitude error computation
     * Error = Commanded - Actual
     */
    pitch_error = sensor->pitch_cmd - sensor->pitch_actual;
    roll_error = sensor->roll_cmd - sensor->roll_actual;
    yaw_error = sensor->yaw_cmd - sensor->yaw_actual;
    
    /* Normalize yaw error to [-180, +180] degrees */
    while (yaw_error > 180.0f) yaw_error -= 360.0f;
    while (yaw_error < -180.0f) yaw_error += 360.0f;
    
    /* ============================================= */
    /* PITCH CHANNEL PID CONTROL                     */
    /* ============================================= */
    
    /**
     * @requirement SRS-FC-032: Pitch control law
     * Output = Kp*e + Ki*∫e + Kd*de/dt
     */
    pitch_cmd = compute_pid(
        pitch_error,
        &control_state.integral_pitch,
        &control_state.prev_error_pitch,
        KP_PITCH,
        KI_PITCH,
        KD_PITCH,
        MAX_INTEGRAL_PITCH
    );
    
    /* ============================================= */
    /* ROLL CHANNEL PID CONTROL                      */
    /* ============================================= */
    
    roll_cmd = compute_pid(
        roll_error,
        &control_state.integral_roll,
        &control_state.prev_error_roll,
        KP_ROLL,
        KI_ROLL,
        KD_ROLL,
        MAX_INTEGRAL_ROLL
    );
    
    /* ============================================= */
    /* YAW CHANNEL PID CONTROL                       */
    /* ============================================= */
    
    yaw_cmd = compute_pid(
        yaw_error,
        &control_state.integral_yaw,
        &control_state.prev_error_yaw,
        KP_YAW,
        KI_YAW,
        KD_YAW,
        MAX_INTEGRAL_YAW
    );
    
    /* ============================================= */
    /* APPLY CONTROL SURFACE LIMITS                  */
    /* ============================================= */
    
    /**
     * @requirement SRS-FC-040: Control surface saturation
     * @safety_critical Prevents physical damage to actuators
     */
    control->elevator = clamp(pitch_cmd, -MAX_ELEVATOR, MAX_ELEVATOR);
    control->aileron = clamp(roll_cmd, -MAX_AILERON, MAX_AILERON);
    control->rudder = clamp(yaw_cmd, -MAX_RUDDER, MAX_RUDDER);
    
    /* ============================================= */
    /* UPDATE STATE FOR NEXT ITERATION               */
    /* ============================================= */
    
    control_state.iteration_count++;
    
    /* Populate diagnostic data */
    control->timestamp = get_system_time_ms();
    control->iteration = control_state.iteration_count;
    control->pitch_error = pitch_error;
    control->roll_error = roll_error;
    control->yaw_error = yaw_error;
}

/**
 * @brief Generic PID computation with anti-windup
 * @param[in] error Current error value
 * @param[in,out] integral Integrator state
 * @param[in,out] prev_error Previous error for derivative
 * @param[in] kp Proportional gain
 * @param[in] ki Integral gain
 * @param[in] kd Derivative gain
 * @param[in] max_integral Integrator clamp limit
 * @return Control output
 */
static float compute_pid(float error, float* integral, float* prev_error,
                         float kp, float ki, float kd, float max_integral)
{
    float p_term, i_term, d_term, output;
    
    /* Proportional term */
    p_term = kp * error;
    
    /* Integral term with anti-windup */
    *integral += error * DT;
    *integral = clamp(*integral, -max_integral, max_integral);
    i_term = ki * (*integral);
    
    /* Derivative term */
    d_term = kd * (error - (*prev_error)) / DT;
    
    /* Total output */
    output = p_term + i_term + d_term;
    
    /* Update previous error */
    *prev_error = error;
    
    return output;
}

/**
 * @brief Clamp value to range
 * @param[in] value Input value
 * @param[in] min Minimum limit
 * @param[in] max Maximum limit
 * @return Clamped value
 */
static float clamp(float value, float min, float max)
{
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

/**
 * @brief Verify control outputs are within safe limits
 * @param[in] control Control output to verify
 * @return true if within limits, false otherwise
 * @requirement SRS-FC-041: Control limit verification
 */
bool verify_control_limits(const control_output_t* control)
{
    if (control == NULL)
    {
        return false;
    }
    
    /* Check elevator limits */
    if (fabs(control->elevator) > MAX_ELEVATOR)
    {
        return false;
    }
    
    /* Check aileron limits */
    if (fabs(control->aileron) > MAX_AILERON)
    {
        return false;
    }
    
    /* Check rudder limits */
    if (fabs(control->rudder) > MAX_RUDDER)
    {
        return false;
    }
    
    /* All limits verified */
    return true;
}

/**
 * @brief Apply saturation to control outputs
 * @param[in,out] control Control output to saturate
 * @requirement SRS-FC-042: Control saturation enforcement
 */
void apply_control_saturation(control_output_t* control)
{
    if (control == NULL)
    {
        return;
    }
    
    control->elevator = clamp(control->elevator, -MAX_ELEVATOR, MAX_ELEVATOR);
    control->aileron = clamp(control->aileron, -MAX_AILERON, MAX_AILERON);
    control->rudder = clamp(control->rudder, -MAX_RUDDER, MAX_RUDDER);
    
    /* Set saturation flag for telemetry */
    control->saturated = true;
}
```

---

## 4. CMake Build System for DO-178C Compliance

### 4.1 Root CMakeLists.txt

```cmake
# ============================================= #
# Flight Control Module Build Configuration    #
# DO-178C DAL A Compliant Build System         #
# ============================================= #

cmake_minimum_required(VERSION 3.20)

project(FlightControlModule
    VERSION 1.0.0
    LANGUAGES C ASM
    DESCRIPTION "DO-178C DAL A Flight Control Partition"
)

# ============================================= #
# CERTIFICATION METADATA                        #
# ============================================= #

set(CERTIFICATION_LEVEL "DAL_A" CACHE STRING "DO-178C Design Assurance Level")
set(PROJECT_ID "FCM-001" CACHE STRING "Project Identifier")
set(TYPE_CERTIFICATE "TC-12345" CACHE STRING "Type Certificate Number")

# ============================================= #
# TOOLCHAIN CONFIGURATION                       #
# ============================================= #

set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR powerpc)

# Cross-compiler paths
set(CMAKE_C_COMPILER powerpc-eabispe-gcc)
set(CMAKE_ASM_COMPILER powerpc-eabispe-gcc)
set(CMAKE_OBJCOPY powerpc-eabispe-objcopy)
set(CMAKE_SIZE powerpc-eabispe-size)

# Deos SDK path
set(DEOS_SDK_ROOT /opt/deos-sdk CACHE PATH "Deos SDK installation directory")
set(DEOS_VERSION "5.1" CACHE STRING "Deos RTOS version")

# Include Deos toolchain file
include(${DEOS_SDK_ROOT}/cmake/deos-toolchain.cmake)

# ============================================= #
# COMPILER FLAGS - MISRA C:2012 COMPLIANCE      #
# ============================================= #

set(CMAKE_C_FLAGS_INIT "")

# Base compiler flags
set(COMMON_FLAGS
    -mcpu=e6500
    -m32
    -mhard-float
    -mfloat-gprs=double
    -fno-common
    -ffunction-sections
    -fdata-sections
)

# Optimization flags (varies by build type)
set(CMAKE_C_FLAGS_DEBUG
    "-O0 -g3 -DDEBUG"
)

set(CMAKE_C_FLAGS_RELEASE
    "-O2 -g1 -DNDEBUG"
)

# DO-178C required flags
set(CERT_FLAGS
    -Wall
    -Wextra
    -Werror
    -Wpedantic
    -std=c99
    -fno-builtin
    -ffreestanding
    -fstack-usage
    -fstrict-aliasing
)

# MISRA C compliance flags
set(MISRA_FLAGS
    -Wcast-qual
    -Wconversion
    -Wsign-conversion
    -Wdouble-promotion
    -Wformat=2
    -Wmissing-prototypes
    -Wstrict-prototypes
    -Wold-style-definition
    -Wundef
    -Wshadow
    -Wwrite-strings
)

# Combine all flags
add_compile_options(
    ${COMMON_FLAGS}
    ${CERT_FLAGS}
    ${MISRA_FLAGS}
)

# ============================================= #
# LINKER FLAGS                                  #
# ============================================= #

set(CMAKE_EXE_LINKER_FLAGS
    "-T ${CMAKE_SOURCE_DIR}/linker/flight_control.ld \
     -Wl,--gc-sections \
     -Wl,-Map=${CMAKE_BINARY_DIR}/flight_control.map \
     -Wl,--cref \
     -nostartfiles"
)

# ============================================= #
# INCLUDE DIRECTORIES                           #
# ============================================= #

include_directories(
    ${CMAKE_SOURCE_DIR}/include
    ${CMAKE_SOURCE_DIR}/partition/flight_control/include
    ${DEOS_SDK_ROOT}/include
    ${DEOS_SDK_ROOT}/include/arinc653
)

# ============================================= #
# STATIC ANALYSIS CONFIGURATION                 #
# ============================================= #

# LDRA Tool Suite integration
set(LDRA_ENABLE ON CACHE BOOL "Enable LDRA static analysis")
set(LDRA_TOOLSUITE /opt/ldra CACHE PATH "LDRA installation directory")

if(LDRA_ENABLE)
    add_custom_target(ldra-analysis
        COMMAND ${LDRA_TOOLSUITE}/bin/ldra-analyzer
                --misra-c-2012
                --dal-a
                --project ${CMAKE_SOURCE_DIR}
                --output ${CMAKE_BINARY_DIR}/ldra-reports
        COMMENT "Running LDRA static analysis (MISRA C:2012 DAL A)"
    )
endif()

# ============================================= #
# COVERAGE ANALYSIS CONFIGURATION               #
# ============================================= #

# Rapita RVS integration
set(RAPITA_ENABLE ON CACHE BOOL "Enable Rapita coverage analysis")
set(RAPITA_RVS /opt/rapita-rvs CACHE PATH "Rapita RVS installation")

if(RAPITA_ENABLE)
    # RapiCover instrumentation
    add_custom_target(rapicov-instrument
        COMMAND ${RAPITA_RVS}/bin/rapicov instrument
                --source ${CMAKE_SOURCE_DIR}/partition/flight_control/src
                --output ${CMAKE_BINARY_DIR}/instrumented
                --coverage mcdc
        COMMENT "Instrumenting code for MC/DC coverage"
    )
    
    # RapiTime WCET analysis
    add_custom_target(rapitime-analyze
        COMMAND ${RAPITA_RVS}/bin/rapitime analyze
                --source ${CMAKE_SOURCE_DIR}/partition/flight_control/src
                --target powerpc-e6500
                --optimization O2
                --cache-model ${CMAKE_SOURCE_DIR}/config/T2080_cache.xml
        COMMENT "Analyzing worst-case execution time (WCET)"
    )
endif()

# ============================================= #
# SUBDIRECTORIES                                #
# ============================================= #

add_subdirectory(partition/flight_control)
add_subdirectory(partition/navigation)
add_subdirectory(partition/communications)
add_subdirectory(partition/health_monitor)
add_subdirectory(common)

# ============================================= #
# CUSTOM TARGETS                                #
# ============================================= #

# Generate loadable binary
add_custom_target(loadable-image ALL
    DEPENDS flight_control
    COMMAND ${CMAKE_OBJCOPY} -O binary
            ${CMAKE_BINARY_DIR}/partition/flight_control/flight_control.elf
            ${CMAKE_BINARY_DIR}/flight_control_v${PROJECT_VERSION}.bin
    COMMENT "Creating loadable binary image"
)

# Size report
add_custom_target(size-report
    DEPENDS flight_control
    COMMAND ${CMAKE_SIZE} --format=berkeley
            ${CMAKE_BINARY_DIR}/partition/flight_control/flight_control.elf
    COMMENT "Generating memory usage report"
)

# Stack usage analysis
add_custom_target(stack-analysis
    COMMAND python3 ${CMAKE_SOURCE_DIR}/scripts/analyze_stack_usage.py
            --su-files ${CMAKE_BINARY_DIR}/**/*.su
            --output ${CMAKE_BINARY_DIR}/stack_report.txt
    COMMENT "Analyzing stack usage"
)

# Traceability matrix generation
add_custom_target(trace-matrix
    COMMAND python3 ${CMAKE_SOURCE_DIR}/scripts/generate_trace_matrix.py
            --requirements ${CMAKE_SOURCE_DIR}/requirements/requirements.csv
            --source ${CMAKE_SOURCE_DIR}
            --output ${CMAKE_BINARY_DIR}/traceability_matrix.html
    COMMENT "Generating requirements traceability matrix"
)

# ============================================= #
# INSTALLATION                                  #
# ============================================= #

install(FILES
    ${CMAKE_BINARY_DIR}/flight_control_v${PROJECT_VERSION}.bin
    ${CMAKE_BINARY_DIR}/flight_control.map
    DESTINATION ${CMAKE_INSTALL_PREFIX}/firmware
)

install(FILES
    ${CMAKE_SOURCE_DIR}/config/arinc653_module.xml
    DESTINATION ${CMAKE_INSTALL_PREFIX}/config
)
```

This implementation guide provides:
- Complete ARINC 653 XML configuration
- Flight control partition source code with DO-178C annotations
- PID control law implementation
- CMake build system with certification tool integration

Would you like me to continue with additional sections covering testing frameworks, HIL setup, or deployment automation?
