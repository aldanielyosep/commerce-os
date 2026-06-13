# Product Requirements Document (PRD)

# Employee Management System

## 1. Overview

### Purpose

Develop an Employee Management System (EMS) to manage employee information, organizational structure, career progression, compensation, employee documents, and user administration.

The system will centralize employee records and provide role-based access for administrators.

### Goals

* Centralize employee master data.
* Manage employee-to-department assignments.
* Track employee lifecycle from hiring to termination.
* Store employee-related documents securely.
* Manage career path and salary history.
* Provide role-based access control.
* Maintain audit information for user authentication activities.

---

# 2. Scope

## In Scope

### Employee Management

* Create employee profile
* Update employee profile
* View employee profile
* Terminate employee
* Employee status management

### Department Management

* Create department
* Update department
* View department
* Assign employees to one or multiple departments

### Employee Documents

* Upload documents
* View documents
* Download documents
* Archive documents

### Career Path Management

* Track employee promotions
* Track position history
* Track career progression

### Salary Management

* Manage current salary
* Track salary history
* Track salary adjustments

### User Management

* Create users
* Manage user roles
* Password management
* Authentication monitoring

---

# 3. User Roles

## Super Admin

Permissions:

* Full system access
* Manage users
* Manage employees
* Manage departments
* Manage salary information
* View audit logs
* Reset user passwords

## Admin

Permissions:

* Manage employees
* Manage departments
* Manage employee documents
* Manage career path
* Manage salary data
* Change own password

Restrictions:

* Cannot create Super Admin
* Cannot access system configuration

---

# 4. Functional Requirements

---

## 4.1 Department Management

### Department Master

System shall provide predefined department values:

| Code  | Department               |
| ----- | ------------------------ |
| ADMIN | Admin                    |
| ECOMM | Ecommerce                |
| PACK  | Packing                  |
| DELIV | Delivery                 |
| CEO   | Chief Executive Officer  |
| CTO   | Chief Technology Officer |
| CFO   | Chief Financial Officer  |
| COO   | Chief Operating Officer  |
| CMO   | Chief Marketing Officer  |

### Rules

* One employee may belong to one or more departments.
* One department may contain multiple employees.

Relationship:

```text
Employee N <-> N Department
```

---

## 4.2 Employee Management

### Employee Information

| Field            | Type                          | Required |
| ---------------- | ----------------------------- | -------- |
| Employee ID      | String                        | Yes      |
| Full Name        | String                        | Yes      |
| Gender           | Enum                          | Yes      |
| Birth Date       | Date                          | Yes      |
| Join Date        | Date                          | Yes      |
| Termination Date | Date                          | No       |
| Status           | Enum                          | Yes      |
| Identity Number  | String                        | Yes      |
| Phone Number     | String (International Format) | Yes      |
| Email            | String                        | Yes      |
| Address          | Text                          | Yes      |
| City             | String                        | Yes      |
| Postal Code      | String                        | Yes      |

### Gender

Values:

* Male
* Female

### Employee Status

Values:

* Active
* Probation
* Resigned
* Terminated
* Retired

### Validation

Phone Number format:

```text
+6281234567890
+6591234567
+11234567890
```

Email validation:

* Must be unique

Employee ID:

* Must be unique

Identity Number:

* Must be unique

---

## 4.3 Employee Document Management

### Supported Documents

Examples:

* National ID Card
* Passport
* Driver License
* Tax ID
* Employment Contract
* Education Certificate
* Other Supporting Documents

### Document Information

| Field         |
| ------------- |
| Document ID   |
| Employee ID   |
| Document Type |
| File Name     |
| File Path     |
| Upload Date   |
| Expiry Date   |
| Uploaded By   |

### Features

* Upload document
* Preview document
* Download document
* Replace document version
* Archive document

Supported file types:

```text
PDF
JPG
JPEG
PNG
DOCX
```

Maximum file size configurable by system.

---

## 4.4 Career Path Management

### Position History

| Field          |
| -------------- |
| Employee       |
| Position       |
| Department     |
| Effective Date |
| Notes          |

### Features

* Record promotion
* Record transfer
* Record position change
* View career timeline

Example:

```text
Junior Staff
    ↓
Senior Staff
    ↓
Supervisor
    ↓
Manager
    ↓
Director
```

---

## 4.5 Salary Management

### Salary Information

| Field          |
| -------------- |
| Employee       |
| Basic Salary   |
| Allowance      |
| Bonus          |
| Effective Date |
| End Date       |
| Notes          |

### Features

* Create salary record
* Update salary record
* Salary adjustment history
* View salary timeline

### Audit Requirements

Salary changes must be logged with:

* Previous value
* New value
* Changed by
* Changed date

---

## 4.6 User Management

### User Information

| Field              |
| ------------------ |
| User ID            |
| Username           |
| Email              |
| Employee Reference |
| Role               |
| Status             |

### User Role

Values:

* Super Admin
* Admin

### Features

* Create user
* Disable user
* Enable user
* Assign role
* Reset password
* Change password

---

## 4.7 Authentication

### Login

Users shall authenticate using:

```text
Username + Password
```

or

```text
Email + Password
```

### Password Policy

Minimum requirements:

* 8 characters
* 1 uppercase
* 1 lowercase
* 1 number
* 1 special character

### Reset Password

Super Admin can:

* Reset user password

### Change Password

Users can:

* Change own password

---

## 4.8 Audit & Security

### User Activity

System shall record:

| Activity        |
| --------------- |
| Last Login      |
| Login Time      |
| Logout Time     |
| Password Change |
| Password Reset  |
| User Creation   |
| User Disable    |
| User Enable     |

### Audit Fields

Every table shall contain:

| Field        |
| ------------ |
| Created By   |
| Created Date |
| Updated By   |
| Updated Date |

---

# 5. Non-Functional Requirements

## Security

* Role-based access control (RBAC)
* Password encryption
* Secure file storage
* Audit logging

## Performance

* Employee search < 2 seconds
* File upload < 10 seconds for files < 20MB

## Availability

* 99.5% uptime

## Scalability

Support:

* 10,000+ employees
* 100,000+ documents