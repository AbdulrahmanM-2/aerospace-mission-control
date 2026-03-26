# DO-178C Certification Documentation Templates
## Complete Document Set for DAL A Approval

---

## 1. Plan for Software Aspects of Certification (PSAC)

### Document Template: PSAC_FlightControl_v1.0.docx

```
===============================================================================
PLAN FOR SOFTWARE ASPECTS OF CERTIFICATION (PSAC)
Flight Control Module
DO-178C Design Assurance Level A
===============================================================================

Document Information
--------------------
Document ID:         PSAC-FCM-001
Revision:            1.0
Date:                2026-03-20
Project:             Flight Control Module
Aircraft:            Boeing 787 / Airbus A350
Type Certificate:    TC-12345
Applicant:           Avionics Systems Inc.
Certification Auth:  FAA Seattle ACO / EASA

Prepared By:         John Smith, Certification Manager
Reviewed By:         Jane Doe, DER Software
Approved By:         Robert Johnson, VP Engineering

===============================================================================
1. INTRODUCTION
===============================================================================

1.1 Purpose
-----------
This Plan for Software Aspects of Certification (PSAC) defines the software
life cycle processes, activities, and deliverables necessary to obtain
certification credit for the Flight Control Module software in accordance
with DO-178C for Design Assurance Level A.

1.2 Scope
---------
The PSAC applies to:
- Flight Control Partition (DAL A)
- Health Monitor Partition (DAL A)
- Navigation Partition (DAL B)
- Communications Partition (DAL C)

RTOS: Deos v5.1 (pre-certified DAL A)
Hardware: NXP QorIQ T2080 (PowerPC e6500)

1.3 Software Overview
---------------------
The Flight Control Module implements primary flight control laws including:
- Pitch, roll, and yaw stability augmentation
- Autopilot modes (altitude hold, heading hold, ILS approach)
- Envelope protection (stall, overspeed)
- Actuator control (elevators, ailerons, rudder)

Criticality: Catastrophic (Loss of control → Loss of aircraft)
Therefore: Design Assurance Level A

1.4 Applicable Documents
------------------------
[1] RTCA DO-178C, "Software Considerations in Airborne Systems and 
    Equipment Certification", December 2011
[2] RTCA DO-330, "Software Tool Qualification Considerations", 2011
[3] RTCA DO-297, "Integrated Modular Avionics Development Guidance", 2005
[4] ARP4754A, "Guidelines for Development of Civil Aircraft and Systems"
[5] CAST-32A, "Multi-core Processors"

===============================================================================
2. SYSTEM OVERVIEW
===============================================================================

2.1 System Architecture
-----------------------
The Flight Control Module operates within an Integrated Modular Avionics (IMA)
architecture using ARINC 653 partitioning.

[Insert System Architecture Diagram]

2.2 Software Components
-----------------------
Component                  DAL    LOC    Language  RTOS
-------------------------- ----   ----   --------  ----
Flight Control Partition   A      8,500  C99       Deos
Health Monitor Partition   A      2,200  C99       Deos
Navigation Partition       B      6,800  C99       Deos
Communications Partition   C      3,400  C99       Deos
ARINC 653 Configuration    -      -      XML       -

Total: 20,900 lines of application code
RTOS: Deos kernel (pre-certified, 45,000 LOC)

===============================================================================
3. SOFTWARE LIFE CYCLE
===============================================================================

3.1 Software Life Cycle Model
------------------------------
A waterfall development model with feedback is used:

Phase 1: Planning (Months 0-6)
Phase 2: Requirements (Months 1-8)
Phase 3: Design (Months 6-12)
Phase 4: Implementation (Months 12-18)
Phase 5: Integration & Test (Months 18-24)
Phase 6: Certification (Months 24-30)

3.2 Transition Criteria
-----------------------
Phase transition requires:
- All deliverables for phase complete
- Independent review completed
- All discrepancies resolved
- Certification authority review (SOI milestones)

===============================================================================
4. SOFTWARE PLANNING PROCESS
===============================================================================

4.1 Organization
----------------
Role                           Responsibility
------------------------------ ------------------------------------------
Project Manager                Overall project coordination
SW Development Lead            Technical leadership, architecture
Requirements Engineers (3)     System/SW requirements development
SW Developers (6)              Code implementation, unit testing
Verification Engineers (4)     Test design/execution, coverage analysis
Configuration Manager          Version control, build management
Quality Assurance Lead         Process compliance, audits
Safety Engineer                Safety analysis, hazard assessment
Certification Manager          Certification liaison, evidence package

Independent Functions:
- Independent V&V Team (3 engineers - separate organization)
- DER (Designated Engineering Representative)

4.2 Development Environment
----------------------------
Hardware:
- Development workstations (Ubuntu 22.04 LTS)
- Target hardware (NAI 68PPC2 dev boards)
- HIL test bench (MIL-STD-1553, ARINC 429 interfaces)

Software Tools:
- Compiler: GCC PowerPC v12.2.0 (DO-330 qualified via usage history)
- RTOS: DDC-I Deos v5.1 (pre-certified DAL A)
- Static Analysis: LDRA Tool Suite v9.7 (DO-330 TQL-5)
- Coverage: Rapita RVS v4.2 (DO-330 TQL-5)
- Unit Test: VectorCAST v24 (DO-330 TQL-5)
- Requirements: IBM DOORS v9.7
- Version Control: Git v2.40
- CI/CD: Jenkins v2.400

Tool Qualification: See Section 11

===============================================================================
5. SOFTWARE DEVELOPMENT PROCESS
===============================================================================

5.1 Software Requirements Process
----------------------------------
Activities:
1. Derive high-level requirements from system requirements
2. Develop low-level requirements from high-level requirements
3. Establish bidirectional traceability
4. Conduct requirements reviews (peer + independent)

Standards: Software Requirements Standards (SRS) document
Reviews: Requirements Review Checklist (RRC)
Tool: IBM DOORS for requirements management

5.2 Software Design Process
----------------------------
Activities:
1. Develop software architecture
2. Define partition interfaces (ARINC 653 ports)
3. Design control algorithms
4. Conduct design reviews (peer + independent)

Standards: Software Design Standards (SDS) document
Notations: UML diagrams, data flow diagrams, state machines
Tool: Enterprise Architect for design modeling

5.3 Software Coding Process
----------------------------
Activities:
1. Implement design in C99
2. Follow MISRA C:2012 coding standards
3. Conduct code reviews (peer + independent)
4. Perform static analysis (LDRA)

Standards: Software Code Standards (SCS) document (MISRA C:2012)
Tools: LDRA Tool Suite for MISRA compliance checking

Output: Source code, MISRA C analysis reports

===============================================================================
6. SOFTWARE VERIFICATION PROCESS
===============================================================================

6.1 Verification Overview
--------------------------
Verification demonstrates that software outputs satisfy input requirements.

Testing Levels:
- Unit Testing (white-box, MC/DC coverage)
- Integration Testing (partition interfaces)
- Hardware-Software Integration (HIL)
- System Testing (requirements-based, black-box)

6.2 Coverage Analysis
---------------------
For DAL A, 100% coverage required for:
- Statement coverage
- Branch coverage
- Modified Condition/Decision Coverage (MC/DC)

Tool: Rapita RapiCover (DO-330 qualified)
Method: Instrumentation-based coverage measurement

6.3 Test Procedures
-------------------
Test cases shall:
- Trace to requirements (bidirectional)
- Include normal and robustness cases
- Define pass/fail criteria
- Be reviewed independently

6.4 Problem Reporting
---------------------
All test failures documented in Problem Reports (PR)
Classification: Critical, Major, Minor
Resolution required before certification

===============================================================================
7. SOFTWARE CONFIGURATION MANAGEMENT PROCESS
===============================================================================

7.1 Configuration Identification
---------------------------------
All software life cycle artifacts under configuration management:
- Requirements (DOORS database)
- Design documents
- Source code (Git repository)
- Test cases and procedures
- Build scripts
- ARINC 653 configuration files

7.2 Baseline Control
--------------------
Baselines:
- Requirements Baseline (Month 8)
- Design Baseline (Month 12)
- Code Baseline (Month 18)
- Certification Baseline (Month 30)

Change Control Board approves all baseline changes

7.3 Traceability
----------------
Bidirectional traceability maintained:
System Req ↔ SW Req ↔ Design ↔ Code ↔ Test

Tool: Automated traceability reports from DOORS + code annotations

===============================================================================
8. SOFTWARE QUALITY ASSURANCE PROCESS
===============================================================================

8.1 QA Activities
-----------------
- Process compliance audits (monthly)
- Product audits (each baseline)
- Review participation (all technical reviews)
- Problem report tracking
- Standards compliance verification

8.2 QA Records
--------------
- Audit reports
- Review minutes
- Conformance review results
- Problem report status

===============================================================================
9. CERTIFICATION LIAISON PROCESS
===============================================================================

9.1 Stages of Involvement (SOI)
--------------------------------
SOI-1 (Month 3):  PSAC approval
SOI-2 (Month 12): Requirements/Design review
SOI-3 (Month 24): Verification review
SOI-4 (Month 28): Final audit, SAS review

9.2 Certification Authority
----------------------------
Primary: FAA Seattle Aircraft Certification Office
DER: John Anderson, DER-SW-12345
Backup: EASA (mutual recognition)

9.3 Compliance Statement
-------------------------
This software complies with DO-178C Design Assurance Level A objectives.
All 71 DAL A objectives will be satisfied.

===============================================================================
10. SOFTWARE ACCOMPLISHMENT SUMMARY
===============================================================================

The Software Accomplishment Summary (SAS) will be delivered at project
completion documenting:
- Summary of software life cycle processes
- Software overview
- Certification considerations
- Compliance matrix (all 71 objectives)

===============================================================================
11. TOOL QUALIFICATION
===============================================================================

Tools requiring qualification per DO-330:

Tool                    TQL    Qualification Approach
----------------------- ------ --------------------------
LDRA Tool Suite         TQL-5  Tool vendor qualification data
Rapita RVS              TQL-5  Tool vendor qualification data
VectorCAST              TQL-5  Tool vendor qualification data
GCC Compiler            TQL-4  Service history (>10 years use)

Tool Qualification Plans developed per DO-330.

===============================================================================
12. PREVIOUSLY DEVELOPED SOFTWARE
===============================================================================

Deos RTOS v5.1:
- DO-178C DAL A certified (2018)
- Service history: 10,000+ aircraft
- Provided by DDC-I with certification package
- Treated as PDC (Previously Developed Component)
- Credit claimed for development, verification

===============================================================================
APPROVAL
===============================================================================

This PSAC is approved for submission to the FAA/EASA.

Prepared By:
    John Smith, Certification Manager    Date: 2026-03-20

Reviewed By:
    Jane Doe, DER Software                Date: 2026-03-20

Approved By:
    Robert Johnson, VP Engineering        Date: 2026-03-20

FAA Approval:
    ____________________________         Date: __________
    (FAA ACO Manager)

===============================================================================
```

---

## 2. Software Verification Plan (SVP) Outline

```
===============================================================================
SOFTWARE VERIFICATION PLAN (SVP)
Flight Control Module
DO-178C DAL A
===============================================================================

1. INTRODUCTION
   1.1 Purpose
   1.2 Scope
   1.3 Applicable Documents
   1.4 Verification Overview

2. VERIFICATION PROCESS
   2.1 Requirements-Based Testing
   2.2 Structural Coverage Analysis
   2.3 Review and Analysis
   2.4 Independence Requirements

3. VERIFICATION METHODS
   3.1 Test
   3.2 Review
   3.3 Analysis
   3.4 Coverage Analysis

4. VERIFICATION ENVIRONMENT
   4.1 Test Equipment
       - HIL test bench configuration
       - Target hardware setup
       - Simulation environment
   4.2 Test Tools
       - VectorCAST for unit testing
       - RapiCover for coverage
       - RapiTime for timing
   4.3 Test Data Management

5. TEST PROCEDURES
   5.1 Unit Test Procedures
       - Test case design
       - Expected results
       - Pass/fail criteria
   5.2 Integration Test Procedures
   5.3 System Test Procedures
   5.4 Robustness Test Procedures

6. COVERAGE ANALYSIS
   6.1 Statement Coverage
   6.2 Branch Coverage
   6.3 MC/DC Coverage
   6.4 Coverage Tool Configuration

7. VERIFICATION INDEPENDENCE
   7.1 Independent Verification Team
   7.2 Independence Criteria
   7.3 Review Participation

8. PROBLEM REPORTING
   8.1 Problem Report Process
   8.2 Classification
   8.3 Resolution Tracking
   8.4 Regression Testing

9. VERIFICATION RESULTS
   9.1 Test Results Documentation
   9.2 Coverage Reports
   9.3 Traceability Matrix
   9.4 Verification Summary

10. APPENDICES
    A. Test Procedures Index
    B. Coverage Analysis Configuration
    C. Test Environment Diagrams
```

---

## 3. Software Accomplishment Summary (SAS) Template

```
===============================================================================
SOFTWARE ACCOMPLISHMENT SUMMARY (SAS)
Flight Control Module v1.0.0
DO-178C DAL A Certification
===============================================================================

Executive Summary
-----------------
The Flight Control Module software has been developed and verified in
accordance with DO-178C for Design Assurance Level A. All 71 objectives
for DAL A have been satisfied.

Certification Status: APPROVED
Type Certificate: TC-12345
Certification Date: 2026-09-15
Certification Authority: FAA Seattle ACO

Software Configuration Index (SCI)
-----------------------------------
Software Part Number: FCM-SW-001-R1.0
Build ID: FCM-20260915-B2847
Binary SHA256: a3f5c9e... (full hash in SCI)

Software Life Cycle Data
------------------------
All required DO-178C life cycle data has been produced and reviewed:
✓ Software Requirements Data
✓ Software Design Description
✓ Source Code
✓ Executable Object Code
✓ Software Verification Cases and Procedures
✓ Software Verification Results
✓ Software Configuration Management Records
✓ Software Quality Assurance Records
✓ Software Accomplishment Summary

Compliance Matrix
-----------------
[Table showing all 71 DO-178C DAL A objectives with satisfaction status]

Objective 1: Plan for Software Aspects of Certification...SATISFIED
Objective 2: Software Development Plan...SATISFIED
...
Objective 71: Archive...SATISFIED

Known Limitations
-----------------
1. Maximum altitude: 45,000 ft MSL
2. Operating temperature: -40°C to +85°C
3. GPS required for navigation (no pure INS fallback)

Certification Considerations
-----------------------------
- RTOS: Deos v5.1 (previously certified)
- Multi-core: CAST-32A compliance documented
- Tool Qualification: 4 tools qualified per DO-330
```

Your complete DO-178C certification documentation template package is ready!
