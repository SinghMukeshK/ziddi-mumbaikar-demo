# Ziddi Mumbaikar - Database Schema Documentation

This document outlines the complete database structure for the Ziddi Mumbaikar NGO website, covering all functionality including volunteer management, donations, help requests, events, and community engagement.

## Table of Contents
1. [User Management](#user-management)
2. [Volunteer Management](#volunteer-management)
3. [Donation Management](#donation-management)
4. [Help Requests](#help-requests)
5. [Events & Campaigns](#events--campaigns)
6. [Impact Tracking](#impact-tracking)
7. [Gallery & Media](#gallery--media)
8. [Communication](#communication)
9. [Admin & Settings](#admin--settings)

---

## 1. User Management

### Table: `users`
Stores all user accounts (volunteers, donors, help requesters, admins)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| phone | VARCHAR(15) | UNIQUE | User phone number (Indian format) |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| role | ENUM | NOT NULL | 'volunteer', 'donor', 'admin', 'user' |
| status | ENUM | DEFAULT 'active' | 'active', 'inactive', 'suspended' |
| profile_image | VARCHAR(500) | NULL | URL to profile picture |
| date_of_birth | DATE | NULL | User's date of birth |
| gender | ENUM | NULL | 'male', 'female', 'other', 'prefer_not_to_say' |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| last_login | TIMESTAMP | NULL | Last login timestamp |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| phone_verified | BOOLEAN | DEFAULT FALSE | Phone verification status |

**Indexes:**
- `idx_email` on `email`
- `idx_phone` on `phone`
- `idx_role` on `role`
- `idx_status` on `status`

---

### Table: `user_addresses`
Stores user addresses (can have multiple)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique address identifier |
| user_id | UUID | FOREIGN KEY (users.id) | Reference to user |
| address_type | ENUM | NOT NULL | 'home', 'work', 'other' |
| address_line1 | VARCHAR(255) | NOT NULL | Street address |
| address_line2 | VARCHAR(255) | NULL | Apartment, suite, etc. |
| locality | VARCHAR(100) | NOT NULL | Area/Locality (e.g., Andheri, Bandra) |
| city | VARCHAR(100) | DEFAULT 'Mumbai' | City name |
| state | VARCHAR(100) | DEFAULT 'Maharashtra' | State name |
| pincode | VARCHAR(10) | NOT NULL | Postal code |
| landmark | VARCHAR(255) | NULL | Nearby landmark |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary address flag |
| latitude | DECIMAL(10,8) | NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NULL | GPS longitude |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_locality` on `locality`
- `idx_pincode` on `pincode`

---

## 2. Volunteer Management

### Table: `volunteers`
Extended information for users who are volunteers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique volunteer identifier |
| user_id | UUID | FOREIGN KEY (users.id) | Reference to user |
| volunteer_id | VARCHAR(20) | UNIQUE | Human-readable ID (e.g., ZM2024001) |
| occupation | VARCHAR(100) | NULL | Current occupation |
| organization | VARCHAR(200) | NULL | Current organization/company |
| skills | TEXT[] | NULL | Array of skills |
| languages | TEXT[] | NULL | Languages spoken |
| emergency_contact_name | VARCHAR(100) | NULL | Emergency contact name |
| emergency_contact_phone | VARCHAR(15) | NULL | Emergency contact phone |
| availability | JSONB | NULL | Availability schedule |
| preferred_areas | TEXT[] | NULL | Preferred localities to work |
| id_proof_type | VARCHAR(50) | NULL | 'aadhaar', 'pan', 'passport', etc. |
| id_proof_number | VARCHAR(50) | NULL | Encrypted ID proof number |
| id_proof_document | VARCHAR(500) | NULL | Document URL |
| police_verification | BOOLEAN | DEFAULT FALSE | Police verification status |
| background_check_date | DATE | NULL | Background check date |
| volunteer_since | DATE | NOT NULL | Date joined as volunteer |
| total_hours | INTEGER | DEFAULT 0 | Total volunteer hours |
| total_events | INTEGER | DEFAULT 0 | Total events participated |
| rating | DECIMAL(3,2) | DEFAULT 0 | Average rating |
| status | ENUM | DEFAULT 'pending' | 'pending', 'active', 'inactive', 'suspended' |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_volunteer_id` on `volunteer_id`
- `idx_status` on `status`
- `idx_preferred_areas` on `preferred_areas` (GIN index)

---

### Table: `volunteer_interests`
Categories of volunteer work volunteers are interested in

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| volunteer_id | UUID | FOREIGN KEY (volunteers.id) | Reference to volunteer |
| category | ENUM | NOT NULL | Interest category |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Category Values:**
- 'cleanliness_drives'
- 'fogging_health'
- 'ambulance_emergency'
- 'women_safety'
- 'community_events'
- 'education'
- 'elderly_care'
- 'blood_donation'
- 'disaster_relief'

**Indexes:**
- `idx_volunteer_id` on `volunteer_id`
- `idx_category` on `category`

---

### Table: `volunteer_attendance`
Track volunteer attendance at events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| volunteer_id | UUID | FOREIGN KEY (volunteers.id) | Reference to volunteer |
| event_id | UUID | FOREIGN KEY (events.id) | Reference to event |
| check_in_time | TIMESTAMP | NULL | Check-in timestamp |
| check_out_time | TIMESTAMP | NULL | Check-out timestamp |
| hours_worked | DECIMAL(5,2) | NULL | Calculated hours |
| tasks_completed | TEXT[] | NULL | Tasks assigned/completed |
| notes | TEXT | NULL | Additional notes |
| rating_received | INTEGER | NULL | Rating (1-5) from coordinator |
| feedback | TEXT | NULL | Feedback from coordinator |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_volunteer_id` on `volunteer_id`
- `idx_event_id` on `event_id`

---

## 3. Donation Management

### Table: `donations`
All donation transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique donation identifier |
| donation_id | VARCHAR(30) | UNIQUE | Human-readable ID (e.g., ZMD20240001) |
| user_id | UUID | FOREIGN KEY (users.id) | Reference to donor (NULL for anonymous) |
| donor_name | VARCHAR(200) | NOT NULL | Donor name |
| donor_email | VARCHAR(255) | NOT NULL | Donor email |
| donor_phone | VARCHAR(15) | NULL | Donor phone |
| donor_pan | VARCHAR(10) | NULL | PAN for 80G certificate |
| amount | DECIMAL(10,2) | NOT NULL | Donation amount in INR |
| currency | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| donation_type | ENUM | NOT NULL | Type of donation |
| category | ENUM | NULL | Purpose category |
| campaign_id | UUID | FOREIGN KEY (campaigns.id) | Linked campaign (NULL if general) |
| payment_method | ENUM | NOT NULL | Payment method used |
| payment_gateway | VARCHAR(50) | NULL | Gateway name (Razorpay, etc.) |
| transaction_id | VARCHAR(100) | UNIQUE | Gateway transaction ID |
| payment_status | ENUM | DEFAULT 'pending' | Payment status |
| receipt_number | VARCHAR(50) | UNIQUE | Receipt number for tax |
| receipt_url | VARCHAR(500) | NULL | URL to receipt PDF |
| certificate_80g_url | VARCHAR(500) | NULL | URL to 80G certificate |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Anonymous donation flag |
| is_recurring | BOOLEAN | DEFAULT FALSE | Recurring donation flag |
| recurring_frequency | ENUM | NULL | 'monthly', 'quarterly', 'yearly' |
| notes | TEXT | NULL | Donor message/notes |
| thank_you_sent | BOOLEAN | DEFAULT FALSE | Thank you email sent flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Donation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Donation Type Values:**
- 'one_time'
- 'recurring'
- 'in_kind' (material donation)

**Category Values:**
- 'general'
- 'cleanliness'
- 'health'
- 'emergency'
- 'education'
- 'infrastructure'

**Payment Method Values:**
- 'online' (UPI, Cards, Net Banking)
- 'cash'
- 'cheque'
- 'bank_transfer'

**Payment Status Values:**
- 'pending'
- 'processing'
- 'completed'
- 'failed'
- 'refunded'

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_donation_id` on `donation_id`
- `idx_transaction_id` on `transaction_id`
- `idx_payment_status` on `payment_status`
- `idx_created_at` on `created_at`

---

### Table: `in_kind_donations`
Material/resource donations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| donation_id | UUID | FOREIGN KEY (donations.id) | Reference to donation |
| item_category | ENUM | NOT NULL | Category of item |
| item_description | TEXT | NOT NULL | Detailed description |
| quantity | INTEGER | NOT NULL | Quantity donated |
| unit | VARCHAR(50) | NOT NULL | Unit (pieces, kg, liters, etc.) |
| estimated_value | DECIMAL(10,2) | NULL | Estimated monetary value |
| condition | ENUM | NOT NULL | 'new', 'like_new', 'good', 'fair' |
| pickup_required | BOOLEAN | DEFAULT FALSE | Requires pickup |
| pickup_address_id | UUID | FOREIGN KEY (user_addresses.id) | Pickup address |
| pickup_date | DATE | NULL | Scheduled pickup date |
| received_date | DATE | NULL | Date item was received |
| images | TEXT[] | NULL | Array of image URLs |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Item Category Values:**
- 'cleaning_supplies'
- 'medical_supplies'
- 'safety_equipment'
- 'clothing'
- 'food'
- 'electronics'
- 'furniture'
- 'books'
- 'other'

**Indexes:**
- `idx_donation_id` on `donation_id`
- `idx_item_category` on `item_category`

---

## 4. Help Requests

### Table: `help_requests`
Community members requesting assistance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique request identifier |
| request_id | VARCHAR(30) | UNIQUE | Human-readable ID (e.g., ZMHR20240001) |
| user_id | UUID | FOREIGN KEY (users.id) | Requester (NULL if not registered) |
| requester_name | VARCHAR(200) | NOT NULL | Name of person requesting |
| requester_phone | VARCHAR(15) | NOT NULL | Contact phone |
| requester_email | VARCHAR(255) | NULL | Contact email |
| help_type | ENUM | NOT NULL | Type of help needed |
| urgency | ENUM | DEFAULT 'medium' | Urgency level |
| title | VARCHAR(255) | NOT NULL | Brief title |
| description | TEXT | NOT NULL | Detailed description |
| location_address_id | UUID | FOREIGN KEY (user_addresses.id) | Location address |
| location_description | TEXT | NULL | Additional location details |
| latitude | DECIMAL(10,8) | NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NULL | GPS longitude |
| affected_people | INTEGER | NULL | Number of people affected |
| images | TEXT[] | NULL | Array of image URLs |
| preferred_date | DATE | NULL | Preferred date for help |
| preferred_time | TIME | NULL | Preferred time |
| status | ENUM | DEFAULT 'pending' | Request status |
| priority_score | INTEGER | DEFAULT 0 | Auto-calculated priority |
| assigned_to | UUID | FOREIGN KEY (volunteers.id) | Assigned volunteer |
| assigned_at | TIMESTAMP | NULL | Assignment timestamp |
| started_at | TIMESTAMP | NULL | Work started timestamp |
| completed_at | TIMESTAMP | NULL | Completion timestamp |
| completion_notes | TEXT | NULL | Completion notes |
| completion_images | TEXT[] | NULL | Before/after images |
| requester_rating | INTEGER | NULL | Requester satisfaction (1-5) |
| requester_feedback | TEXT | NULL | Requester feedback |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Help Type Values:**
- 'cleanliness' (garbage, drainage issues)
- 'fogging' (mosquito control)
- 'ambulance' (emergency medical transport)
- 'health_camp' (medical checkup needed)
- 'safety' (security concerns)
- 'infrastructure' (potholes, street lights)
- 'elderly_assistance'
- 'women_safety'
- 'flood_relief'
- 'other'

**Urgency Values:**
- 'low'
- 'medium'
- 'high'
- 'critical'

**Status Values:**
- 'pending' (submitted, awaiting review)
- 'approved' (reviewed and approved)
- 'assigned' (assigned to volunteer/team)
- 'in_progress' (work started)
- 'completed' (work finished)
- 'rejected' (cannot fulfill)
- 'cancelled' (cancelled by requester)

**Indexes:**
- `idx_request_id` on `request_id`
- `idx_user_id` on `user_id`
- `idx_help_type` on `help_type`
- `idx_status` on `status`
- `idx_urgency` on `urgency`
- `idx_created_at` on `created_at`

---

## 5. Events & Campaigns

### Table: `events`
All events/drives organized

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique event identifier |
| event_id | VARCHAR(30) | UNIQUE | Human-readable ID (e.g., ZMEV20240001) |
| title | VARCHAR(255) | NOT NULL | Event title |
| slug | VARCHAR(255) | UNIQUE | URL-friendly slug |
| description | TEXT | NOT NULL | Full description |
| event_type | ENUM | NOT NULL | Type of event |
| category | ENUM | NOT NULL | Event category |
| start_date | TIMESTAMP | NOT NULL | Event start date/time |
| end_date | TIMESTAMP | NOT NULL | Event end date/time |
| registration_deadline | TIMESTAMP | NULL | Last date to register |
| venue_name | VARCHAR(255) | NULL | Venue name |
| venue_address | TEXT | NULL | Full address |
| locality | VARCHAR(100) | NOT NULL | Area/Locality |
| latitude | DECIMAL(10,8) | NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NULL | GPS longitude |
| max_volunteers | INTEGER | NULL | Maximum volunteers needed |
| min_volunteers | INTEGER | NULL | Minimum volunteers required |
| registered_count | INTEGER | DEFAULT 0 | Current registrations |
| attended_count | INTEGER | DEFAULT 0 | Actual attendance |
| organizer_id | UUID | FOREIGN KEY (users.id) | Event organizer |
| coordinator_ids | UUID[] | NULL | Array of coordinator user IDs |
| target_audience | TEXT | NULL | Who should attend |
| requirements | TEXT | NULL | What to bring |
| meeting_point | TEXT | NULL | Meeting point details |
| banner_image | VARCHAR(500) | NULL | Event banner URL |
| images | TEXT[] | NULL | Array of image URLs |
| status | ENUM | DEFAULT 'draft' | Event status |
| is_featured | BOOLEAN | DEFAULT FALSE | Featured event flag |
| budget | DECIMAL(10,2) | NULL | Event budget |
| actual_expense | DECIMAL(10,2) | NULL | Actual expense |
| impact_metrics | JSONB | NULL | Event impact data |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |
| published_at | TIMESTAMP | NULL | Publication timestamp |

**Event Type Values:**
- 'cleanliness_drive'
- 'fogging_campaign'
- 'health_camp'
- 'blood_donation'
- 'awareness_campaign'
- 'training_workshop'
- 'community_meeting'
- 'emergency_response'
- 'festival_celebration'

**Status Values:**
- 'draft'
- 'published'
- 'ongoing'
- 'completed'
- 'cancelled'

**Indexes:**
- `idx_event_id` on `event_id`
- `idx_slug` on `slug`
- `idx_event_type` on `event_type`
- `idx_status` on `status`
- `idx_start_date` on `start_date`
- `idx_locality` on `locality`

---

### Table: `event_registrations`
Volunteer registrations for events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| event_id | UUID | FOREIGN KEY (events.id) | Reference to event |
| volunteer_id | UUID | FOREIGN KEY (volunteers.id) | Reference to volunteer |
| registration_date | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| status | ENUM | DEFAULT 'registered' | Registration status |
| attendance_status | ENUM | NULL | Attendance status |
| role_assigned | VARCHAR(100) | NULL | Role in event |
| notes | TEXT | NULL | Special notes |
| cancelled_at | TIMESTAMP | NULL | Cancellation timestamp |
| cancellation_reason | TEXT | NULL | Why cancelled |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Status Values:**
- 'registered'
- 'confirmed'
- 'waitlisted'
- 'cancelled'

**Attendance Status:**
- 'present'
- 'absent'
- 'late'
- 'left_early'

**Indexes:**
- `idx_event_id` on `event_id`
- `idx_volunteer_id` on `volunteer_id`
- Unique constraint on (`event_id`, `volunteer_id`)

---

### Table: `campaigns`
Fundraising or awareness campaigns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique campaign identifier |
| campaign_id | VARCHAR(30) | UNIQUE | Human-readable ID |
| title | VARCHAR(255) | NOT NULL | Campaign title |
| slug | VARCHAR(255) | UNIQUE | URL-friendly slug |
| description | TEXT | NOT NULL | Full description |
| campaign_type | ENUM | NOT NULL | 'fundraising', 'awareness', 'both' |
| category | ENUM | NOT NULL | Campaign category |
| goal_amount | DECIMAL(12,2) | NULL | Fundraising goal (if applicable) |
| raised_amount | DECIMAL(12,2) | DEFAULT 0 | Amount raised so far |
| donor_count | INTEGER | DEFAULT 0 | Number of donors |
| start_date | DATE | NOT NULL | Campaign start date |
| end_date | DATE | NOT NULL | Campaign end date |
| banner_image | VARCHAR(500) | NULL | Campaign banner |
| images | TEXT[] | NULL | Gallery images |
| video_url | VARCHAR(500) | NULL | Campaign video |
| beneficiaries | INTEGER | NULL | Number of beneficiaries |
| status | ENUM | DEFAULT 'draft' | Campaign status |
| is_featured | BOOLEAN | DEFAULT FALSE | Featured on homepage |
| created_by | UUID | FOREIGN KEY (users.id) | Creator user |
| updates | JSONB | NULL | Campaign updates array |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Category Values:**
- 'education'
- 'health'
- 'infrastructure'
- 'emergency_relief'
- 'environment'
- 'women_empowerment'
- 'elderly_care'

**Status Values:**
- 'draft'
- 'active'
- 'paused'
- 'completed'
- 'cancelled'

**Indexes:**
- `idx_campaign_id` on `campaign_id`
- `idx_slug` on `slug`
- `idx_status` on `status`
- `idx_end_date` on `end_date`

---

## 6. Impact Tracking

### Table: `impact_metrics`
Track overall impact statistics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| metric_date | DATE | NOT NULL | Date of metric |
| total_volunteers | INTEGER | DEFAULT 0 | Total active volunteers |
| total_events | INTEGER | DEFAULT 0 | Total events conducted |
| total_hours | INTEGER | DEFAULT 0 | Total volunteer hours |
| total_donations | DECIMAL(12,2) | DEFAULT 0 | Total donations received |
| total_donors | INTEGER | DEFAULT 0 | Total unique donors |
| help_requests_received | INTEGER | DEFAULT 0 | Help requests received |
| help_requests_completed | INTEGER | DEFAULT 0 | Help requests completed |
| areas_covered | INTEGER | DEFAULT 0 | Number of localities served |
| people_impacted | INTEGER | DEFAULT 0 | Estimated people impacted |
| waste_collected_kg | DECIMAL(10,2) | DEFAULT 0 | Waste collected in kg |
| trees_planted | INTEGER | DEFAULT 0 | Trees planted |
| health_camps_conducted | INTEGER | DEFAULT 0 | Health camps |
| people_screened | INTEGER | DEFAULT 0 | People screened in health camps |
| blood_units_collected | INTEGER | DEFAULT 0 | Blood donation units |
| ambulance_services | INTEGER | DEFAULT 0 | Ambulance services provided |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_metric_date` on `metric_date`

---

### Table: `event_impact`
Specific impact data for each event

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| event_id | UUID | FOREIGN KEY (events.id) | Reference to event |
| volunteers_participated | INTEGER | DEFAULT 0 | Volunteers who attended |
| hours_contributed | DECIMAL(8,2) | DEFAULT 0 | Total volunteer hours |
| area_covered_sqm | DECIMAL(10,2) | NULL | Area covered in sq meters |
| waste_collected_kg | DECIMAL(10,2) | NULL | Waste collected in kg |
| people_reached | INTEGER | NULL | People directly reached |
| families_benefited | INTEGER | NULL | Families benefited |
| materials_distributed | JSONB | NULL | Materials distributed details |
| before_photos | TEXT[] | NULL | Before photos |
| after_photos | TEXT[] | NULL | After photos |
| success_stories | TEXT | NULL | Success stories |
| challenges_faced | TEXT | NULL | Challenges encountered |
| lessons_learned | TEXT | NULL | Lessons learned |
| media_coverage | JSONB | NULL | Media coverage details |
| social_media_reach | INTEGER | NULL | Social media impressions |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_event_id` on `event_id`

---

## 7. Gallery & Media

### Table: `gallery`
Photo gallery for website

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Photo title |
| description | TEXT | NULL | Photo description |
| image_url | VARCHAR(500) | NOT NULL | Image URL |
| thumbnail_url | VARCHAR(500) | NULL | Thumbnail URL |
| category | ENUM | NOT NULL | Gallery category |
| event_id | UUID | FOREIGN KEY (events.id) | Linked event (if any) |
| campaign_id | UUID | FOREIGN KEY (campaigns.id) | Linked campaign (if any) |
| taken_date | DATE | NULL | Date photo was taken |
| location | VARCHAR(255) | NULL | Location description |
| uploaded_by | UUID | FOREIGN KEY (users.id) | Uploader |
| photographer_name | VARCHAR(200) | NULL | Photographer credit |
| is_featured | BOOLEAN | DEFAULT FALSE | Featured on homepage |
| display_order | INTEGER | DEFAULT 0 | Display order |
| views | INTEGER | DEFAULT 0 | View count |
| likes | INTEGER | DEFAULT 0 | Like count |
| status | ENUM | DEFAULT 'pending' | 'pending', 'approved', 'rejected' |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Category Values:**
- 'cleanliness_drive'
- 'fogging_campaign'
- 'health_camp'
- 'community_event'
- 'volunteers'
- 'before_after'
- 'team'
- 'awards'
- 'media'

**Indexes:**
- `idx_category` on `category`
- `idx_event_id` on `event_id`
- `idx_status` on `status`
- `idx_is_featured` on `is_featured`

---

### Table: `testimonials`
User testimonials and success stories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (users.id) | Reference to user |
| name | VARCHAR(200) | NOT NULL | Person's name |
| role | VARCHAR(100) | NULL | Role (Volunteer, Beneficiary, Donor) |
| testimonial | TEXT | NOT NULL | Testimonial text |
| rating | INTEGER | NULL | Rating (1-5) |
| image_url | VARCHAR(500) | NULL | Person's photo |
| event_id | UUID | FOREIGN KEY (events.id) | Related event |
| is_featured | BOOLEAN | DEFAULT FALSE | Featured testimonial |
| display_order | INTEGER | DEFAULT 0 | Display order |
| status | ENUM | DEFAULT 'pending' | 'pending', 'approved', 'rejected' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| approved_at | TIMESTAMP | NULL | Approval timestamp |

**Indexes:**
- `idx_status` on `status`
- `idx_is_featured` on `is_featured`

---

## 8. Communication

### Table: `notifications`
In-app notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (users.id) | Recipient user |
| type | ENUM | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| action_url | VARCHAR(500) | NULL | URL to navigate to |
| related_entity_type | VARCHAR(50) | NULL | Entity type (event, donation, etc.) |
| related_entity_id | UUID | NULL | Entity ID |
| priority | ENUM | DEFAULT 'normal' | 'low', 'normal', 'high', 'urgent' |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| read_at | TIMESTAMP | NULL | Read timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Type Values:**
- 'event_reminder'
- 'event_update'
- 'donation_receipt'
- 'help_request_update'
- 'volunteer_approval'
- 'system_announcement'

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_is_read` on `is_read`
- `idx_created_at` on `created_at`

---

### Table: `email_logs`
Track all emails sent

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (users.id) | Recipient user |
| recipient_email | VARCHAR(255) | NOT NULL | Email address |
| email_type | ENUM | NOT NULL | Type of email |
| subject | VARCHAR(255) | NOT NULL | Email subject |
| template_used | VARCHAR(100) | NULL | Template name |
| status | ENUM | DEFAULT 'sent' | 'sent', 'delivered', 'bounced', 'failed' |
| error_message | TEXT | NULL | Error if failed |
| opened_at | TIMESTAMP | NULL | Email opened timestamp |
| clicked_at | TIMESTAMP | NULL | Link clicked timestamp |
| sent_at | TIMESTAMP | DEFAULT NOW() | Sent timestamp |

**Email Type Values:**
- 'welcome'
- 'volunteer_approval'
- 'event_confirmation'
- 'event_reminder'
- 'donation_receipt'
- 'thank_you'
- 'help_request_update'
- 'newsletter'
- 'password_reset'

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_email_type` on `email_type`
- `idx_sent_at` on `sent_at`

---

### Table: `sms_logs`
Track SMS communications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (users.id) | Recipient user |
| phone_number | VARCHAR(15) | NOT NULL | Phone number |
| message | TEXT | NOT NULL | SMS content |
| sms_type | ENUM | NOT NULL | Type of SMS |
| status | ENUM | DEFAULT 'sent' | 'sent', 'delivered', 'failed' |
| provider | VARCHAR(50) | NULL | SMS provider used |
| provider_message_id | VARCHAR(100) | NULL | Provider's message ID |
| cost | DECIMAL(8,4) | NULL | SMS cost |
| sent_at | TIMESTAMP | DEFAULT NOW() | Sent timestamp |
| delivered_at | TIMESTAMP | NULL | Delivered timestamp |

**SMS Type Values:**
- 'otp'
- 'event_reminder'
- 'emergency_alert'
- 'volunteer_confirmation'
- 'help_request_update'

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_phone_number` on `phone_number`
- `idx_sent_at` on `sent_at`

---

### Table: `newsletter_subscribers`
Newsletter subscription list

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Subscriber email |
| name | VARCHAR(200) | NULL | Subscriber name |
| user_id | UUID | FOREIGN KEY (users.id) | Linked user (if any) |
| categories | TEXT[] | NULL | Interested categories |
| status | ENUM | DEFAULT 'active' | 'active', 'unsubscribed', 'bounced' |
| subscribed_at | TIMESTAMP | DEFAULT NOW() | Subscription timestamp |
| unsubscribed_at | TIMESTAMP | NULL | Unsubscription timestamp |
| verification_token | VARCHAR(100) | NULL | Email verification token |
| verified_at | TIMESTAMP | NULL | Verification timestamp |

**Indexes:**
- `idx_email` on `email`
- `idx_status` on `status`

---

## 9. Admin & Settings

### Table: `settings`
System-wide settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Setting key |
| value | TEXT | NULL | Setting value |
| data_type | VARCHAR(50) | NOT NULL | 'string', 'number', 'boolean', 'json' |
| category | VARCHAR(100) | NOT NULL | Setting category |
| description | TEXT | NULL | Setting description |
| is_public | BOOLEAN | DEFAULT FALSE | Can be exposed to frontend |
| updated_by | UUID | FOREIGN KEY (users.id) | Last updated by |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_key` on `key`
- `idx_category` on `category`

---

### Table: `audit_logs`
Track all important system actions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (users.id) | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NOT NULL | Entity affected |
| entity_id | UUID | NULL | Entity ID |
| old_values | JSONB | NULL | Old values (for updates) |
| new_values | JSONB | NULL | New values |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | TEXT | NULL | Browser/device info |
| created_at | TIMESTAMP | DEFAULT NOW() | Action timestamp |

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_entity_type` on `entity_type`
- `idx_created_at` on `created_at`

---

### Table: `admin_roles`
Admin role definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| role_name | VARCHAR(100) | UNIQUE, NOT NULL | Role name |
| permissions | JSONB | NOT NULL | Permissions array |
| description | TEXT | NULL | Role description |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

---

### Table: `user_roles`
Assign roles to users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (users.id) | Reference to user |
| role_id | UUID | FOREIGN KEY (admin_roles.id) | Reference to role |
| assigned_by | UUID | FOREIGN KEY (users.id) | Who assigned |
| assigned_at | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |

**Indexes:**
- Unique constraint on (`user_id`, `role_id`)

---

## Relationships Summary

### One-to-Many Relationships
- `users` → `user_addresses` (one user can have multiple addresses)
- `users` → `donations` (one user can make multiple donations)
- `users` → `help_requests` (one user can submit multiple requests)
- `volunteers` → `event_registrations` (one volunteer can register for multiple events)
- `events` → `event_registrations` (one event can have multiple registrations)
- `campaigns` → `donations` (one campaign can receive multiple donations)

### One-to-One Relationships
- `users` → `volunteers` (a user can be a volunteer)
- `donations` → `in_kind_donations` (one donation can have in-kind details)

### Many-to-Many Relationships
- `volunteers` ↔ `events` (through `event_registrations`)
- `volunteers` ↔ `volunteer_interests` (many volunteers, many interest categories)

---

## Indexes Strategy

### Primary Indexes (Already Covered)
- All PRIMARY KEY constraints
- All UNIQUE constraints
- All FOREIGN KEY constraints

### Additional Recommended Indexes
1. **Composite Indexes:**
   - `(user_id, created_at)` on `donations` - for user donation history
   - `(status, urgency, created_at)` on `help_requests` - for prioritization
   - `(event_id, volunteer_id)` on `event_registrations` - prevent duplicates
   - `(locality, created_at)` on `events` - for location-based queries

2. **Full-Text Search Indexes:**
   - On `description` in `events` table
   - On `description` in `help_requests` table
   - On `testimonial` in `testimonials` table

3. **GIN Indexes (for PostgreSQL):**
   - On `skills` array in `volunteers`
   - On `languages` array in `volunteers`
   - On `images` array in `gallery`

---

## Data Retention & Archival

### Hot Data (Active Database)
- Last 2 years of events
- Last 5 years of donations (for tax purposes)
- Last 1 year of notifications
- Active help requests only

### Cold Storage (Archive)
- Events older than 2 years
- Email/SMS logs older than 1 year
- Audit logs older than 3 years (keep summary)

---

## Security Considerations

1. **Encryption:**
   - `password_hash` - bcrypt with salt
   - `id_proof_number` - AES encryption
   - PAN numbers - encrypted at rest

2. **PII Data:**
   - Phone numbers
   - Email addresses
   - Addresses
   - ID proof documents

3. **Access Control:**
   - Row-level security for multi-tenant scenarios
   - Role-based access control (RBAC)
   - Audit logging for sensitive operations

4. **Data Anonymization:**
   - Option for anonymous donations
   - Data masking for reports
   - GDPR compliance for data deletion

---

## Backup Strategy

1. **Daily Backups:**
   - Full database backup at midnight
   - Transaction log backups every hour

2. **Weekly Backups:**
   - Full backup with extended retention (4 weeks)

3. **Monthly Backups:**
   - Archive backup (retain for 1 year)

4. **Disaster Recovery:**
   - Geo-replicated backups
   - Point-in-time recovery capability
   - Recovery time objective (RTO): 1 hour
   - Recovery point objective (RPO): 15 minutes

---

## Performance Optimization

1. **Query Optimization:**
   - Use EXPLAIN ANALYZE for slow queries
   - Implement query result caching
   - Use materialized views for complex reports

2. **Connection Pooling:**
   - Maximum connections: 100
   - Minimum idle connections: 10
   - Connection timeout: 30 seconds

3. **Caching Strategy:**
   - Redis for session management
   - Cache frequently accessed data:
     - Impact statistics
     - Featured events
     - Gallery images
     - Settings

4. **Database Partitioning:**
   - Partition `audit_logs` by month
   - Partition `email_logs` by quarter
   - Partition `donations` by year

---

## Future Enhancements

1. **Mobile App Support:**
   - Add `device_tokens` table for push notifications
   - Add `app_sessions` table for analytics

2. **Advanced Features:**
   - `volunteer_teams` table for team management
   - `resource_inventory` table for resource tracking
   - `partnerships` table for corporate partnerships
   - `grants` table for grant management

3. **Analytics:**
   - `user_analytics` table for behavior tracking
   - `campaign_analytics` table for campaign performance
   - `conversion_funnels` table for tracking volunteer/donor journey

---

## Conclusion

This database schema provides a comprehensive foundation for the Ziddi Mumbaikar NGO website, supporting:
- ✅ Volunteer management and tracking
- ✅ Donation processing and receipts
- ✅ Help request management
- ✅ Event organization and attendance
- ✅ Campaign management
- ✅ Impact measurement
- ✅ Gallery and testimonials
- ✅ Communication (email, SMS, notifications)
- ✅ Admin operations and audit trails

The schema is designed to be scalable, secure, and maintainable while ensuring data integrity and optimal performance.
