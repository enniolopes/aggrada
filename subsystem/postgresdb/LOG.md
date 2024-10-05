# LOG Database Structure

### 1. Core Fields

Focus on the absolute essentials needed to trace, understand, and manage logs across various systems:

- `type`: Specifies the severity.
- `message`: A clear, human-readable description of the event.

#### 1.1. Core Log Types (ENUMs)

Based on extensive research, the following ENUM values for log types are recommended as they cover a broad range of use cases and are commonly accepted in industry and academic standards:

**ERROR**: Indicates a significant issue that requires immediate attention. This level is used when the application encounters a serious issue, such as a failure that impacts the functionality of the system.

**WARN**: Represents potentially harmful situations that do not stop the application but could lead to problems if not addressed. This level is often used for issues that need monitoring but aren't immediately critical.

**INFO**: Used to track the general flow of the application. It provides information about regular operations, such as user logins, data processing milestones, or system status updates.

**DEBUG**: Provides detailed information that is useful for diagnosing problems. It is typically used during development or troubleshooting and includes granular details like variable values or the steps in a process.

**TRACE**: A finer-grained informational event than DEBUG, often used to trace program execution in more detail. It's useful in very detailed debugging scenarios.

### 2. Optional, But Useful Fields

These fields should be included if they add value, but are not mandatory:

- `source`: Defines the origin of the log for queries indexing, for example it could be LOGIN for log events from this module.
- `context`: A JSON field that can store any additional, structured data specific to the log entry.
- `core_user_email`: Logs the user responsible for the action, if relevant.
- `related_log_id`: Allows linking to another log entry, useful in complex workflows.
