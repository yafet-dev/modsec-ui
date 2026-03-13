# Users Guide

## Overview

The Users page allows you to manage team members and control access to your WAF management portal. You can invite users, assign roles, and manage their access status.

![Users Overview](screenshots/users-overview.png)
*Screenshot: Users page showing team members table*

---

## Accessing the Users Page

1. Navigate to **Users** from the main sidebar menu
2. You'll see all team members in your organization

---

## Key Features

### User Roles

**Admin**
- Full access to all features
- Can manage users, settings, and configurations
- Maximum of 3 admins per organization

**Viewer**
- Read-only access to Dashboard and Logs
- Cannot modify settings or manage users
- Unlimited viewers allowed

### Admin Limit

- **Maximum**: 3 admins per organization
- **Display**: Shows "X of 3 admin slots used" at the top of the page
- **Restriction**: Cannot add more admins once limit is reached

![Admin Limit](screenshots/admin-limit.png)
*Screenshot: Admin limit indicator*

---

## Adding Users

### Steps

1. Click **"Add User"** button (top right)
2. Enter the user's **email address**
3. Select **role** (Admin or Viewer)
4. Click **"Add User"** to send invitation

### Requirements

- Valid email address format
- Email must not already exist in the organization
- Admin role only available if under the 3-admin limit

![Add User Modal](screenshots/add-user-modal.png)
*Screenshot: Add user form*

---

## User Status

**Active** (Verified)
- User has accepted invitation and can access the portal
- Green badge indicator

**Pending**
- Invitation sent but not yet accepted
- Yellow badge indicator
- Can resend invitation by clicking email and selecting "Resend Invite"

**Disabled**
- User account is temporarily disabled
- Gray badge indicator
- User cannot access the portal

---

## User Table Information

The table displays:
- **Name**: User's full name or email username
- **Email**: Clickable email address
- **Role**: Admin or Viewer badge
- **Status**: Active, Pending, or Disabled
- **Last Login**: When user last accessed the portal

---

## User Actions

### Enable/Disable User

- Click **"Enable"** or **"Disable"** button in Actions column
- Disabled users cannot access the portal
- Use to temporarily restrict access without deleting

### Delete User

- Click **"Delete"** button in Actions column
- Confirmation required before deletion
- **Warning**: This action cannot be undone

### Resend Invitation

- Click on user's email address to select
- Click **"Resend Invite"** button (only visible for pending users)
- Sends a new invitation email

---

## Best Practices

1. **Role Assignment**: Assign Admin role only to trusted team members who need full access
2. **Admin Limit**: Plan admin assignments carefully due to the 3-admin limit
3. **Regular Review**: Periodically review user list and remove inactive users
4. **Disable vs Delete**: Use Disable for temporary access restrictions, Delete for permanent removal

---

## Troubleshooting

**Can't add admin?**
- Check if you've reached the 3-admin limit
- The limit indicator shows how many admin slots are used

**User not receiving invitation?**
- Check email address is correct
- Use "Resend Invite" if invitation was sent previously
- Verify email didn't go to spam folder

**Can't see Add User button?**
- Only Admins can add users
- Viewers have read-only access

---

*For more information, see the [Overview Guide](./overview.md).*

*Last updated: [Date]*
