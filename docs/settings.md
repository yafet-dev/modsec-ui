# Settings Guide

## Overview

The Settings page provides comprehensive control over your Web Application Firewall protection, access controls, and notification preferences. All settings are organized into four main sections accessible via tabs at the top of the page.

![Settings Overview](screenshots/settings-overview.png)
*Screenshot: Settings page with tab navigation*

---

## Accessing Settings

1. Navigate to **Settings** from the main sidebar menu
2. You'll see four tabs: **WAF**, **IP Ban List**, **Geo Access**, and **Notifications**
3. Click any tab to access that section's configuration

---

## 1. WAF Settings

The WAF (Web Application Firewall) section allows you to control protection for each of your domains individually.

### Enable/Disable WAF Protection

**Per-Domain Control:**
- Each domain in your organization has its own WAF toggle switch
- Toggle switches are located on the right side of each domain entry
- **Enabled** (blue switch): Domain is protected by WAF
- **Disabled** (gray switch): WAF protection is turned off for that domain

**Status Indicators:**
- **Green "Enabled" badge**: WAF is active and protecting the domain
- **Gray "Disabled" badge**: WAF protection is inactive

**How to Use:**
1. Find the domain you want to configure
2. Click the toggle switch to enable or disable protection
3. A loading indicator appears while the change is being saved
4. The status updates immediately once saved

![WAF Settings](screenshots/waf-settings.png)
*Screenshot: WAF protection toggles for each domain*

**Important Notes:**
- Changes take effect immediately
- Disabling WAF removes protection from that domain
- Each domain can be configured independently
- When enabled, WAF blocks common threats like SQL injection, XSS, and malicious traffic patterns

### Summary Reports

Configure periodic email summaries of WAF activity across your domains.

**Configuration Options:**

**Enable/Disable Reports:**
- Toggle switch at the top to enable or disable summary reports
- When disabled, no reports will be sent

**Email Addresses:**
- Add multiple email addresses to receive reports
- Enter email in the input field and click "Add"
- Remove emails by clicking the X on each email tag
- At least one email is required when reports are enabled

**Frequency Options:**
- **Hourly**: Summary every hour with latest activity
- **Daily**: Daily summary at end of day with all activity
- **Weekly**: Weekly summary every Monday with week's activity
- **Monthly**: Monthly summary on first day of each month

**Saving Settings:**
- Click "Save Settings" to apply your configuration
- Settings are saved and displayed in a summary card
- Edit or remove settings at any time

![Summary Reports](screenshots/summary-reports.png)
*Screenshot: Summary reports configuration*

---

## 2. IP Ban List

Manage IP addresses that are blocked from accessing your domains. This helps you respond to specific threats and prevent repeat attackers.

### Viewing Banned IPs

The IP Ban List displays:
- **IP Address**: The banned IP address
- **Country**: Geographic location (auto-detected)
- **Domain**: Which domain(s) the ban applies to ("All Domains" or specific domain)
- **Reason**: Optional reason for the ban
- **Banned Date**: When the IP was added to the ban list

![IP Ban List](screenshots/ip-ban-list.png)
*Screenshot: List of banned IP addresses*

### Adding an IP Ban

**Steps:**
1. Click **"Add IP Ban"** button (top right)
2. Enter the **IP address** (e.g., 192.168.1.100)
3. Select **Domain**:
   - **All Domains**: Ban applies to all your domains
   - **Specific Domain**: Ban applies only to the selected domain
4. Enter **Reason** (optional): Why this IP is being banned
5. Click **"Add Ban"** to save

**Auto-Detection:**
- Country is automatically detected when you enter an IP address
- Country flag and name appear below the IP input field
- This helps you understand the geographic origin of the threat

![Add IP Ban](screenshots/add-ip-ban.png)
*Screenshot: Add IP ban modal*

**Use Cases:**
- Block repeat attackers identified in logs
- Prevent known malicious IPs from accessing your sites
- Respond to specific security incidents
- Restrict access from problematic geographic regions

### Removing an IP Ban

1. Find the IP address in the list
2. Click the **"Remove"** button
3. Confirm the removal in the dialog
4. The IP is immediately removed from the ban list

**Important:**
- Removing a ban allows that IP to access your domains again
- Consider reviewing logs before removing bans
- You can always re-add an IP if needed

---

## 3. Geo Access Control

Control access to your domains based on the geographic location (country) of visitors. This helps you comply with regional regulations or block high-risk regions.

### Access Modes

**Allow All** (Default)
- No geographic restrictions
- All countries can access your domains
- Use when you want global access

**Allow Only**
- Whitelist mode: Only selected countries can access
- All other countries are automatically blocked
- Use for compliance or market-specific access

**Ban Specific**
- Blacklist mode: Selected countries are blocked
- All other countries can access normally
- Use to block high-risk regions while allowing others

![Geo Access Modes](screenshots/geo-access-modes.png)
*Screenshot: Geo access mode selection*

### Configuring Geo Access

**Step 1: Select Domain**
- Choose which domain these rules apply to
- Select "All" to apply to all domains
- Or select a specific domain for domain-specific rules

**Step 2: Choose Mode**
- Click on the radio button for your desired mode
- **Allow All**: No restrictions
- **Allow Only**: Select countries to allow
- **Ban Specific**: Select countries to block

**Step 3: Select Countries** (if using Allow Only or Ban Specific)
- Use the search bar to find countries quickly
- Click country chips to select/deselect
- Selected countries are highlighted
- Use "Select All" to select all filtered countries
- Countries are sorted with selected ones first

**Step 4: Save Settings**
- Click **"Save Geo-Location Settings"** button
- Confirm the action in the dialog
- Settings are applied immediately

![Geo Access Configuration](screenshots/geo-access-config.png)
*Screenshot: Country selection interface*

**Country Selection Tips:**
- Search by country name or country code
- Selected countries appear at the top of the list
- Use "Select All" for quick bulk selection
- Click chips again to deselect countries

**Best Practices:**
- **Compliance**: Use "Allow Only" to restrict access to specific markets
- **Security**: Use "Ban Specific" to block known high-risk regions
- **Testing**: Start with "Ban Specific" to block a few countries, then expand if needed
- **Documentation**: Keep notes on why certain countries are restricted

---

## 4. Notifications

Configure how and when you receive security alerts. You can set up both email and Telegram notifications with customizable filters.

### Notification Types

**Email Notifications**
- Receive alerts via email
- Add multiple email addresses
- Real-time delivery when events occur

**Telegram Notifications**
- Receive alerts in Telegram messenger
- Instant delivery and interactive actions
- Connect via bot link

### Creating a Notification Setting

**Step 1: Choose Notification Type**
- Click on **"Email"** or **"Telegram"** tile
- Selected type is highlighted

**Step 2: Configure Destination**

**For Email:**
- Add email addresses in the "Email Addresses" field
- Enter email and press Enter or click "Add"
- Multiple emails can be added
- Remove emails by clicking the X on each tag

**For Telegram:**
- Click **"Generate Connect Link"**
- Copy the link or open it directly
- Open the link in Telegram
- Send `/start` to the bot or use the provided deep link
- Click "Connect" button in Telegram to complete connection

![Telegram Connect](screenshots/telegram-connect.png)
*Screenshot: Telegram connection process*

**Step 3: Set Filters**

**Domain Filter:**
- **All Domains**: Receive alerts for all your domains
- **Specific Domains**: Select which domains trigger alerts
- Click domain chips to select/deselect

**Severity Filter:**
- **All**: Receive alerts for all severity levels
- **Critical**: Only critical threats
- **High**: Critical and high severity
- **Low**: All except critical (low, medium, high)

**Step 4: Save**
- Click **"Save Notification Setting"**
- Setting appears in the list above
- You can create multiple notification settings

![Notification Configuration](screenshots/notification-config.png)
*Screenshot: Notification settings form*

### Managing Notification Settings

**Viewing Settings:**
- All configured notifications appear as cards at the top
- Each card shows:
  - Notification type (Email or Telegram)
  - Destination (emails or Telegram chat ID)
  - Domain filter
  - Severity filter

**Editing Settings:**
- Click **"Edit"** on any notification card
- Modify filters, emails, or other settings
- Click **"Save"** to update

**Removing Settings:**
- Click **"Remove"** on any notification card
- Confirm removal in the dialog
- Setting is deleted and notifications stop

**Testing Notifications:**
- Click **"Send Test"** button (for Telegram)
- Sends a sample notification to verify setup
- Use to ensure notifications are working correctly

### Telegram-Specific Features

**Connection Status:**
- **Connected**: Green indicator shows Telegram is linked
- **Not Connected**: Shows connection instructions
- **Disconnect**: Button to remove Telegram connection

**Interactive Actions:**
- Telegram messages include action buttons
- **Ban IP Address**: Quick ban button in alert messages
- Clicking opens a secure link to ban the IP

**Connection Process:**
1. Generate connect link in settings
2. Open link in Telegram (opens bot chat)
3. Bot sends welcome message with connect button
4. Click "Connect" button in Telegram
5. Connection confirmed, ready to receive alerts

---

## Settings Workflow

### Initial Setup

1. **Enable WAF**: Go to WAF tab, enable protection for your domains
2. **Configure Notifications**: Set up email or Telegram alerts
3. **Review Geo Access**: Configure geographic restrictions if needed
4. **Monitor IP Bans**: Add IPs to ban list as threats are identified

### Daily Operations

1. **Check WAF Status**: Verify all domains have protection enabled
2. **Review IP Bans**: Check banned IPs and add new ones from logs
3. **Monitor Notifications**: Ensure alerts are being received
4. **Adjust Settings**: Update filters or add/remove notification channels

### Ongoing Management

1. **Weekly Review**: Check notification settings and test delivery
2. **IP Ban Maintenance**: Review and remove outdated bans
3. **Geo Rule Updates**: Adjust country restrictions based on threat patterns
4. **Summary Reports**: Review summary report settings and recipients

---

## Best Practices

### WAF Settings
- **Keep WAF Enabled**: Only disable for troubleshooting or maintenance
- **Monitor Summary Reports**: Review weekly summaries to understand threat patterns
- **Domain-Specific Control**: Use per-domain toggles for granular control

### IP Ban Management
- **Document Reasons**: Add reasons when banning IPs for future reference
- **Regular Review**: Periodically review ban list and remove outdated entries
- **Use Specific Domains**: Ban IPs on specific domains when possible, not all domains

### Geo Access Control
- **Start Conservative**: Begin with "Ban Specific" for a few high-risk countries
- **Compliance First**: Use "Allow Only" when required by regulations
- **Test Changes**: Monitor logs after changing geo rules to ensure they work as expected

### Notifications
- **Multiple Channels**: Set up both email and Telegram for redundancy
- **Appropriate Filters**: Use severity filters to avoid alert fatigue
- **Test Regularly**: Send test notifications to verify delivery
- **Domain-Specific Alerts**: Create separate settings for different domains if needed

---

## Troubleshooting

### WAF Not Enabling
- Check if domain is properly configured in your organization
- Verify organization status is "active"
- Refresh the page and try again

### IP Ban Not Working
- Verify the IP address format is correct (IPv4)
- Check which domain the ban applies to
- Review logs to confirm the IP is being blocked

### Geo Access Not Applying
- Ensure settings are saved (check for confirmation message)
- Verify the correct domain is selected
- Check that countries are properly selected in the mode you're using

### Notifications Not Received
- **Email**: Check spam folder, verify email addresses are correct
- **Telegram**: Ensure bot is connected (check connection status)
- **Filters**: Verify severity and domain filters aren't too restrictive
- **Test**: Use "Send Test" to verify notification delivery

### Settings Not Saving
- Check for error messages
- Verify you have admin permissions
- Ensure organization is active
- Try refreshing the page

---

## Integration with Other Features

### From Logs to Settings
- **IP Bans**: Identify malicious IPs in logs, add them in IP Ban List
- **Geo Rules**: Review geographic patterns in logs, adjust Geo Access accordingly
- **Notifications**: Use log insights to configure appropriate severity filters

### From Dashboard to Settings
- **WAF Status**: Dashboard shows overall protection status
- **Threat Patterns**: Use dashboard data to inform notification filters
- **Attack Origins**: Use map data to configure geo-blocking strategies

---

*For more information about other features, see the [Overview Guide](./overview.md), [Dashboard Guide](./dashboard.md), or [Logs Guide](./logs.md).*

*Last updated: [Date]*
