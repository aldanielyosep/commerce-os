# PRD-P1 (Legacy)

Status dokumen ini: legacy reference only.

Dokumen HR aktif gunakan:

- [PRD-100 HR Foundation](./PRD-100-hr-foundation.md)
- [RFC-100 HR Foundation Implementation](../rfc/RFC-100-hr-foundation.md)

Dokumen ini dipertahankan untuk histori pembahasan lama yang bersifat parsial.

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