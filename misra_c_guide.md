# MISRA C:2012 Compliance Guide
## Aviation-Grade Coding Standards for DO-178C

---

## 1. MISRA C Overview for Avionics

### 1.1 Why MISRA C in DO-178C?

MISRA C:2012 is the de facto coding standard for safety-critical avionics software:

- **DO-178C Requirement**: Software Code Standards (SCS) must be defined
- **Industry Practice**: MISRA C provides comprehensive, proven rules
- **Tool Support**: LDRA, Polyspace, PC-lint all support MISRA C checking
- **Certification Acceptance**: FAA/EASA DERs recognize MISRA C compliance

**For DAL A certification:**
- All 143 mandatory rules must be satisfied
- All 16 required rules must be satisfied  
- Advisory rules should be followed unless documented deviation
- Every deviation requires formal justification

---

## 2. Common MISRA C Violations and Fixes

### 2.1 Rule 1.3: No Undefined Behavior

**Violation Example:**
```c
/* BAD: Signed integer overflow - undefined behavior */
int32_t altitude_ft = 50000;
int32_t climb_rate_fpm = 2000;

void update_altitude(void)
{
    altitude_ft = altitude_ft + climb_rate_fpm;  /* Can overflow */
}
```

**Fixed Version:**
```c
/* GOOD: Check for overflow before operation */
int32_t altitude_ft = 50000;
int32_t climb_rate_fpm = 2000;

void update_altitude(void)
{
    /* Check for overflow before adding */
    if (altitude_ft > (INT32_MAX - climb_rate_fpm))
    {
        /* Saturate at maximum */
        altitude_ft = INT32_MAX;
        log_warning("Altitude calculation saturated");
    }
    else
    {
        altitude_ft = altitude_ft + climb_rate_fpm;
    }
}
```

This guide provides practical examples of MISRA C compliance for avionics applications, with real violation scenarios and certified fixes.
