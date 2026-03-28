# ERP Backend Architecture Analysis

This document serves as a structural overview of the ERP backend, specifically tailored for frontend design and integration purposes. 

## 1. Core Architecture & Philosophy
The backend is built around a generic **Kanban/Board** architecture rather than strictly typed ERP models (like `Invoice` or `Loan`). 
Instead of hardcoding ERP entities, workflows like **Loans** and **Invoices** are created as *Cards* on specialized *Boards*, customized via dynamically defined `customFields`.

## 2. Entities & Models

### User & Auth
- **User**: Core account model.
  - *Fields*: `name`, `email`, `password`, `avatar`, `orgRole` (super_admin, org_admin, top_management, user), `isActive`, `departments`, `boardPermissions`.
- **Invite**: Used to onboard new members via email links.
  - *Fields*: `email`, `orgRole`, `departments`, `token`, `status`, `expiresAt`.

### Organizational Structure
- **Department**: Grouping for boards and users.
  - *Fields*: `name`, `slug`, `icon`, `color`, `heads`, `members`.

### Board & Workflow Engine
- **Board**: Represents a workflow space (e.g., "Invoices", "Loan Approvals").
  - *Fields*: `name`, `description`, `department`, `isCompanyBoard`, `columns`, `customFields`, `settings` (requiresApproval, approvers, isLocked, complianceTagging).
  - *Custom Fields*: Type-safe generic schema (text, number, date, dropdown, user).
  - *Columns*: Define workflow stages (e.g., Backlog $\to$ In Progress $\to$ Done).
- **Card**: An individual item of work (e.g., a specific Invoice or Loan application).
  - *Fields*: `title`, `description`, `board`, `column`, `assignees`, `dueDate`, `priority`, `customFields` (values for the board's fields), `attachments`, `approval`, `comments`, `auditLog`.
- **Activity & Notification**: System logs and user alerts.

## 3. API Endpoints

### Authentication (`/api/auth`)
- `POST /register`
- `POST /login`
- `GET /me`

### User Management & Invites (`/api/users`, `/api/invites`, `/api/departments`)
- **Departments**: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, `POST /:id/members`, `DELETE /:id/members/:userId`
- **Users**: `GET /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/activate`, `PATCH /:id/deactivate`
- **Invites**: `POST /`, `GET /`, `DELETE /:id`, `GET /validate/:token`, `POST /accept/:token`

### Boards & Columns (`/api/boards`)
- **Boards**: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- **Columns**: `POST /:id/columns`, `PATCH /:id/columns/:colId`, `DELETE /:id/columns/:colId`
- **Custom Fields**: `POST /:id/fields`, `PATCH /:id/fields/:fieldId`, `DELETE /:id/fields/:fieldId`

### Cards & Approvals (`/api/cards`)
- **CRUD**: `GET /?boardId=...`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- **Actions**: `PATCH /:id/move` (moves between columns)
- **Collaboration**: `POST /:id/comments`, `POST /:id/attachments` (in `/api/upload`), `DELETE /:id/attachments/:attachmentId`
- **Approvals**: `POST /:id/approve`, `POST /:id/reject`

### Analytics (`/api/analytics`)
- `GET /overview`
- `GET /departments`
- `GET /activity`

## 4. Workflows

### 1. Invoices & Loans
- **Backend Representation**: Captured as `Cards`. For Invoices, a board is created with custom fields (`Invoice Amount(number)`, `Client(text)`, `Date(date)`). For Loans, another board is created for tracking loan lifecycles.
- **Frontend Implication**: The frontend must dynamically render input forms based on the `Board.customFields` schema.

### 2. Approval Workflow
- A Board can be configured with `settings.requiresApproval = true` and an array of `approvers`.
- Cards on such boards possess an `approval` object.
- Frontend should utilize `POST /:cardId/approve` or `POST /:cardId/reject` endpoints and transition statuses from `pending` to `approved` or `rejected`.

### 3. User Management Workflow
- **Invite Flow**: Admins call `POST /invites` to generate an email link.
- **Accept Flow**: User clicks link, frontend passes token to `GET /validate/:token`, and then `POST /accept/:token` with credentials to finalize the user creation.
- **Access Control**: Handled via `orgRole` and specific `boardPermissions`.

## 5. Summary for Frontend Design
- **Flexibility is Key**: The UI should not hardcode "Loan Amount" but instead map through a card's `customFields`.
- **State Management**: Moving a card calls `PATCH /cards/:cardId/move`.
- **Approvals**: Specific UI surfaces (like an "Action Required" panel) should query for cards where `approval.status == 'pending'` and the current user is in `approval.approvers`.
