# Logs Guide

## Overview

The Logs page provides comprehensive access to all security events and WAF activity. It allows you to search, filter, and analyze detailed information about every request processed by your Web Application Firewall, helping you investigate incidents, identify patterns, and maintain security compliance.

![Logs Overview](screenshots/logs-overview.png)
*Screenshot: Full logs page view showing stats, filters, and log table*

---

## Accessing the Logs Page

1. Log in to your WAF management portal
2. Navigate to **Logs** from the main sidebar menu
3. You'll see all security events for your organization's domains

---

## Page Components

### 1. Header and Domain Filter

At the top of the page, you'll find:

- **Page Title**: "Logs" with description "View and analyze WAF event logs"
- **Host Selector**: Dropdown menu to filter logs by specific domain
  - Select "All" to view logs from all your domains
  - Select a specific domain to view logs for that domain only

![Logs Header](screenshots/logs-header.png)
*Screenshot: Logs page header with host selector*

**Use Cases:**
- Focus on a specific domain experiencing issues
- Compare security events across different domains
- Isolate logs for troubleshooting

---

### 2. Statistics Overview

Three key metrics are displayed at the top of the page:

#### Blocked Today
Shows the total number of requests that were blocked by the WAF today. This includes all blocked attacks regardless of severity level.

#### Allowed Today
Displays the number of requests that were allowed through (marked as warnings). These are typically suspicious requests that were logged but not blocked.

#### Top Rule
Shows the security rule that has been triggered most frequently. This helps identify the most common type of attack or security event.

![Logs Statistics](screenshots/logs-stats.png)
*Screenshot: Statistics cards showing Blocked Today, Allowed Today, and Top Rule*

**Understanding the Stats:**
- **High Blocked Count**: Indicates active attack attempts
- **High Allowed Count**: May indicate legitimate traffic or low-severity events
- **Top Rule**: Helps identify attack patterns and common threats

---

### 3. Search and Filters

The Logs page provides powerful filtering options to help you find specific events quickly.

#### Search Bar
- **Location**: Large search input at the top of the filter section
- **What to Search**: 
  - Request URI (the URL path)
  - IP addresses
  - Rule IDs
  - Rule names
- **How to Use**: Simply type your search term and results update automatically

**Search Tips:**
- Use partial matches (e.g., "admin" will find "/admin/login")
- Search for IP addresses to find all events from a specific source
- Search for rule IDs to see all events triggered by a specific rule

#### Severity Filter
- **Options**: All Severities, Critical, High, Medium, Low
- **Purpose**: Filter logs by the severity level of the security event
- **Use Cases**:
  - Focus on critical threats only
  - Review high-severity events for immediate action
  - Analyze low-severity events for patterns

**Severity Levels:**
- **Critical**: Immediate threats requiring urgent attention
- **High**: Significant security risks
- **Medium**: Moderate security concerns
- **Low**: Minor security events or suspicious activity

#### Action Filter
- **Options**: All Actions, Blocked, Allowed
- **Purpose**: Filter by what action the WAF took
- **Use Cases**:
  - Review only blocked attacks
  - See allowed requests that triggered warnings
  - Compare blocked vs. allowed patterns

![Logs Filters](screenshots/logs-filters.png)
*Screenshot: Search bar and filter dropdowns*

**Filtering Best Practices:**
1. Start broad: Begin with "All" filters to see the full picture
2. Narrow down: Use filters to focus on specific concerns
3. Combine filters: Use multiple filters together for precise results
4. Clear filters: Reset to "All" when starting a new investigation

---

### 4. Logs Table

The main table displays all security events matching your current filters. Each row represents a single security event.

#### Table Columns

**Timestamp**
- Shows when the event occurred
- Format: Date and time (e.g., "02/23/2026, 3:45:12 PM")
- Click to sort chronologically

**Client IP**
- The IP address from which the request originated
- Displayed in monospace font for easy reading
- Click on a log entry to see geographic location details

**Request URI**
- The URL path that was requested
- Truncated if too long (hover or click for full details)
- Helps identify which pages or endpoints were targeted

**Rule**
- The security rule that detected the threat
- Shows rule name and rule ID (if available)
- Helps understand what type of attack was detected

**Severity**
- Color-coded badge indicating threat level:
  - **Red**: Critical
  - **Orange**: High
  - **Yellow**: Medium
  - **Gray**: Low

**Action**
- What the WAF did:
  - **Red "Blocked"**: Request was denied
  - **Green "Allowed"**: Request was permitted (warning logged)

![Logs Table](screenshots/logs-table.png)
*Screenshot: Logs table with columns and sample entries*

#### Interacting with the Table

- **Click any row**: Opens detailed information panel for that event
- **Hover over rows**: Highlights the row for easy identification
- **Scroll**: Navigate through multiple pages of logs

---

### 5. Pagination

At the bottom of the table, you'll find pagination controls.

**Information Displayed:**
- "Showing X of Y logs" - Current page count and total
- Page numbers - Navigate between pages
- Previous/Next buttons - Move through pages

**How to Use:**
- Click page numbers to jump to specific pages
- Use Previous/Next buttons for sequential navigation
- Each page shows 10 log entries

![Logs Pagination](screenshots/logs-pagination.png)
*Screenshot: Pagination controls*

**Note**: Filters automatically reset to page 1 when changed, ensuring you see the most relevant results first.

---

### 6. Log Detail Panel

Clicking on any log entry opens a detailed side panel with complete information about that security event.

#### Panel Sections

**Header**
- Event title and description
- Close button (X) or press Escape key to close

**Action and Severity Badges**
- Quick visual indicators at the top
- Same color coding as the table

**Detailed Information:**
- **Timestamp**: Exact date and time of the event
- **Client IP**: Source IP address with country information
- **Host**: The domain that received the request
- **Method**: HTTP method (GET, POST, etc.)
- **Request URI**: Full URL path that was requested
- **Rule**: Security rule name and ID that triggered
- **User Agent**: Browser or client information
- **Headers**: Complete HTTP request headers (formatted JSON)
- **Request Body**: Request payload if available (formatted for readability)

![Log Detail Panel](screenshots/log-detail-panel.png)
*Screenshot: Detailed log information panel*

**How to Use:**
- Click any log entry to open details
- Click outside the panel or press Escape to close
- Scroll within the panel to see all information
- Use the formatted JSON to understand request structure

**Use Cases:**
- **Forensic Analysis**: Understand exactly what happened
- **Attack Investigation**: Review full request details
- **Compliance**: Document security events with complete information
- **Troubleshooting**: Identify false positives or configuration issues

---

## Common Workflows

### Investigating a Specific Attack

1. **Identify the Event**: Use search or filters to find the log entry
2. **View Details**: Click on the log entry to open the detail panel
3. **Review Information**: Check IP address, request URI, and rule details
4. **Take Action**: 
   - Note the IP address for potential blocking
   - Review the rule to understand the threat type
   - Check if similar attacks are occurring

### Finding All Events from an IP Address

1. **Use Search**: Enter the IP address in the search bar
2. **Review Results**: All events from that IP will be displayed
3. **Analyze Pattern**: Look for repeated attacks or suspicious behavior
4. **Consider Blocking**: If malicious, add to IP Ban List in Settings

### Analyzing Attack Patterns

1. **Filter by Severity**: Select "High" or "Critical" to focus on serious threats
2. **Review Top Rule**: Check the statistics to see the most common attack type
3. **Examine Request URIs**: Identify which pages or endpoints are being targeted
4. **Check Timestamps**: Look for patterns in attack timing
5. **Geographic Analysis**: Review IP addresses to identify attack sources

### Daily Security Review

1. **Check Statistics**: Review "Blocked Today" and "Allowed Today" counts
2. **Filter Critical Events**: Set severity filter to "Critical"
3. **Review Top Rule**: Understand the most common threat type
4. **Investigate Anomalies**: Look for unusual patterns or spikes
5. **Document Findings**: Note any trends or concerns

### Weekly Security Audit

1. **Remove Filters**: Start with all logs visible
2. **Review Blocked Attacks**: Filter by "Blocked" action
3. **Analyze Patterns**: Look for recurring IPs, rules, or URIs
4. **Check Geographic Distribution**: Review IP addresses and countries
5. **Export Data**: Use log details for compliance reporting

---

## Understanding Log Information

### Severity Levels Explained

**Critical**
- Immediate security threats
- Often indicates active exploitation attempts
- Requires immediate investigation
- Examples: SQL injection, remote code execution attempts

**High**
- Significant security risks
- Potential for serious impact if successful
- Should be reviewed promptly
- Examples: XSS attempts, path traversal

**Medium**
- Moderate security concerns
- May indicate reconnaissance or scanning
- Worth monitoring for patterns
- Examples: Suspicious user agents, unusual requests

**Low**
- Minor security events
- Often informational or suspicious activity
- May indicate automated scanning
- Examples: Bot traffic, unusual headers

### Action Types Explained

**Blocked**
- The WAF denied the request
- The attacker did not reach your application
- Your system is protected
- These are successful security interventions

**Allowed (Warning)**
- The request was permitted but logged
- May indicate suspicious but not malicious activity
- Useful for monitoring and pattern detection
- May require manual review

### Rule Information

**Rule Name**
- Human-readable description of what was detected
- Examples: "SQL Injection Attack", "XSS Attempt"

**Rule ID**
- Unique identifier for the security rule
- Used for reference and documentation
- Helps identify specific rule configurations

---

## Tips for Effective Log Analysis

### Search Strategies

1. **Start Broad**: Begin with general searches, then narrow down
2. **Use Multiple Terms**: Combine IP addresses with rule names
3. **Search by Time**: Use filters along with timestamp review
4. **Pattern Recognition**: Look for repeated patterns in URIs or IPs

### Filter Combinations

1. **High-Severity Blocked**: Filter by "High" severity and "Blocked" action
2. **Critical Events**: Filter by "Critical" severity only
3. **Specific Domain**: Use host selector with severity filters
4. **Time-Based**: Combine filters with pagination to review by date

### Investigation Workflow

1. **Identify**: Use search or filters to find relevant events
2. **Examine**: Click entries to view detailed information
3. **Analyze**: Look for patterns, repeated IPs, or attack types
4. **Document**: Note findings for reporting or action
5. **Act**: Take appropriate action (block IPs, adjust rules, etc.)

### Performance Tips

1. **Use Filters**: Filters reduce the number of logs to load
2. **Specific Searches**: More specific searches are faster
3. **Domain Filter**: Filter by domain when investigating specific issues
4. **Pagination**: Navigate through results rather than loading all at once

---

## Troubleshooting

### No Logs Appearing

**Possible Causes:**
- Filters are too restrictive (try resetting to "All")
- No events match your search criteria
- Domain filter excludes all your domains
- Time period has no events

**Solutions:**
- Reset all filters to "All"
- Clear the search bar
- Select "All" in the host selector
- Check if WAF is enabled for your domains

### Logs Not Updating

**Possible Causes:**
- Page needs to be refreshed
- No new events are occurring
- Network connectivity issues

**Solutions:**
- Refresh the page (F5 or browser refresh)
- Check your internet connection
- Verify WAF is active and processing requests

### Can't Find Specific Log

**Possible Causes:**
- Search term doesn't match exactly
- Filters exclude the log entry
- Log is on a different page

**Solutions:**
- Try partial search terms
- Reset filters and search again
- Check multiple pages of results
- Use broader search criteria

### Detail Panel Not Opening

**Possible Causes:**
- JavaScript disabled
- Browser compatibility issues
- Click didn't register

**Solutions:**
- Ensure JavaScript is enabled
- Try clicking directly on the row
- Refresh the page and try again
- Check browser console for errors

---

## Best Practices

### Regular Monitoring

1. **Daily Checks**: Review critical and high-severity events daily
2. **Weekly Reviews**: Conduct comprehensive log analysis weekly
3. **Monthly Audits**: Perform detailed security audits monthly

### Security Response

1. **Immediate Action**: Investigate critical events immediately
2. **Pattern Recognition**: Look for repeated attacks from same IPs
3. **Documentation**: Keep records of significant security events
4. **Follow-Up**: Verify that blocked attacks don't recur

### Data Management

1. **Focus on Relevant Data**: Use filters to focus on important events
2. **Export When Needed**: Use detail panel information for reporting
3. **Regular Cleanup**: Review and archive old logs periodically
4. **Compliance**: Maintain logs according to your compliance requirements

---

## Integration with Other Features

### From Logs to Actions

**Block IP Addresses:**
1. Identify malicious IPs in log entries
2. Navigate to Settings → IP Ban List
3. Add the IP address to the ban list

**Adjust Geo-Rules:**
1. Review geographic patterns in log IPs
2. Navigate to Settings → Geo Access
3. Block or allow specific countries

**Review Dashboard:**
1. Use log insights to understand dashboard metrics
2. Cross-reference log data with dashboard statistics
3. Validate security posture

**Check Notifications:**
1. Verify notification settings match your log review priorities
2. Adjust severity filters in notifications based on log analysis
3. Ensure important events trigger alerts

---

## Next Steps

After reviewing your logs, you may want to:

- **Block Malicious IPs**: Go to Settings → IP Ban List
- **Adjust Security Rules**: Contact your administrator about rule changes
- **Review Dashboard**: Check overall security metrics
- **Configure Notifications**: Set up alerts for important events
- **Export Data**: Use log details for compliance or reporting

---

*For more information about other features, see the [Overview Guide](./overview.md) or [Dashboard Guide](./dashboard.md).*

*Last updated: [Date]*
