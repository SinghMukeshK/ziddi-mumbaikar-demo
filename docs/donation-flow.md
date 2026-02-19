# Donation Flow Documentation

## Overview
This document describes the complete donation functionality on the Ziddi Mumbaikar platform, allowing users to contribute to fundraisers through multiple payment methods.

## User Journey

### 1. Entry Points
Users can initiate a donation from multiple locations:

#### Fundraiser Listing Page (`/fundraisers`)
- Each fundraiser card displays:
  - Raised amount and goal
  - Progress bar with percentage
  - Number of supporters
  - "Donate Now" button (or "View Details" if completed)
- Clicking button navigates to fundraiser detail page

#### Fundraiser Detail Page (`/fundraisers/[id]`)
- Prominent "Donate Now" button in sticky sidebar
- Contains full fundraiser information
- Click opens donation modal

### 2. Donation Modal

The modal provides a comprehensive donation experience with the following sections:

#### Modal Header
- Title: "Make a Donation"
- Close button (X icon)
- Primary-colored header bar

#### Fundraiser Information
- Shows the fundraiser title being donated to
- Provides context for the donation

#### Amount Selection
**Predefined Amounts:**
- ₹500
- ₹1,000
- ₹2,000
- ₹5,000

**Custom Amount:**
- Text input for any amount ≥ ₹100
- Rupee symbol (₹) prefix
- Validation for minimum amount

**Behavior:**
- Selecting predefined amount clears custom input
- Entering custom amount deselects predefined options
- Selected amount highlighted with primary color

#### Donor Information
**Anonymous Option:**
- Checkbox to "Donate anonymously"
- When checked, hides donor detail fields
- Name will appear as "Anonymous" in supporters list

**Required Fields (if not anonymous):**
- Full Name
- Email Address
- Phone Number (10 digits)

#### Payment Method Selection
Three payment options (radio buttons):

1. **UPI / QR Code**
   - Icon: Checkmark circle
   - Default selection
   - For UPI apps (PhonePe, Google Pay, Paytm, etc.)

2. **Credit / Debit Card**
   - Icon: Credit card
   - For Visa, Mastercard, RuPay, etc.

3. **Net Banking**
   - Icon: Bank building
   - For direct bank transfers

#### Tax Benefits Information
If fundraiser is eligible (`taxBenefits: true`):
- Green info box displayed
- Message: "80G tax exemption certificate will be issued for your donation"
- Checkmark icon

#### Modal Footer
- **Left side:** Total amount display
  - Label: "Total Amount"
  - Large, bold amount: ₹X,XXX
- **Right side:** Action button
  - Text: "Proceed to Pay" (or "Processing..." when loading)
  - Primary-colored button
  - Disabled when amount not selected or during processing

### 3. Validation

#### Client-Side Validation
1. **Amount Validation:**
   - Must be ≥ ₹100
   - Error: "Minimum donation amount is ₹100"

2. **Donor Details Validation (if not anonymous):**
   - All fields required
   - Email format validation
   - Phone: 10 digits maximum
   - Error: "Please fill in all required fields"

#### Form State Management
- Real-time error display
- Error clearing on user interaction
- Loading state during submission
- Button disabled states

### 4. Submission Flow

#### Current Implementation (Mock)
```typescript
const donationData = {
  fundraiserId: fundraiserData.id,
  amount: finalAmount,
  donorName: isAnonymous ? 'Anonymous' : donorName,
  donorEmail: isAnonymous ? '' : donorEmail,
  donorPhone: isAnonymous ? '' : donorPhone,
  paymentMethod,
  isAnonymous,
}
```

#### Production Implementation (TODO)
Will integrate with Razorpay/similar payment gateway:

**Step 1: Create Order**
```
POST /api/donations/create-order
{
  fundraiserId: string,
  amount: number,
  donorDetails: {...},
  paymentMethod: string
}

Response:
{
  orderId: string,
  amount: number,
  currency: "INR"
}
```

**Step 2: Redirect to Payment Gateway**
- Initialize Razorpay/payment SDK
- Pass order details
- Handle payment callbacks

**Step 3: Verify Payment**
```
POST /api/donations/verify-payment
{
  orderId: string,
  paymentId: string,
  signature: string
}

Response:
{
  success: boolean,
  transactionId: string,
  receiptUrl: string
}
```

**Step 4: Update Database**
- Add to `donations` table
- Update fundraiser `raisedAmount`
- Increment `totalSupporters`
- Generate 80G certificate if applicable
- Send confirmation emails

### 5. Success Flow

#### Current (Mock)
- Alert message with donation amount
- Modal closes
- Form resets
- Success message: "Thank you for your donation of ₹X! Payment gateway integration pending."

#### Production (TODO)
- Redirect to success page
- Display transaction details
- Show receipt/80G certificate
- Add to recent supporters list
- Update progress bar in real-time
- Send email confirmation
- Option to share donation on social media

### 6. Error Handling

#### User Errors
- Invalid amount
- Missing required fields
- Invalid email/phone format

#### System Errors
- API failures
- Payment gateway errors
- Network issues

**Error Display:**
- Red banner at top of modal
- Specific error message
- Retry option

## Features

### Interactive UI
✅ Modal overlay with backdrop click to close
✅ Smooth animations and transitions
✅ Responsive design (mobile-friendly)
✅ Loading states during processing
✅ Disabled states for buttons

### Amount Handling
✅ Predefined quick amounts
✅ Custom amount input
✅ Real-time total calculation
✅ Number formatting with commas (₹1,000)
✅ Minimum amount validation

### Privacy Options
✅ Anonymous donation checkbox
✅ Conditional form fields
✅ Name appears as "Anonymous" when selected

### Visual Feedback
✅ Selected amount highlighting
✅ Active payment method indication
✅ Error messages
✅ Loading indicators
✅ Success confirmation

## Data Structure

### Donation Object
```typescript
interface Donation {
  id: string
  fundraiserId: string
  amount: number
  donorName: string
  donorEmail: string | null
  donorPhone: string | null
  paymentMethod: 'upi' | 'card' | 'netbanking'
  isAnonymous: boolean
  transactionId: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}
```

### Fundraiser Updates
After successful donation:
```typescript
fundraiser.raisedAmount += donation.amount
fundraiser.totalSupporters += 1
fundraiser.supporters.unshift({
  name: donation.isAnonymous ? 'Anonymous' : donation.donorName,
  amount: donation.amount,
  date: 'Just now'
})
```

## Integration Points

### Required API Endpoints

#### 1. Create Donation Order
```
POST /api/donations/create-order
```

#### 2. Verify Payment
```
POST /api/donations/verify-payment
```

#### 3. Get Donation Receipt
```
GET /api/donations/{id}/receipt
```

#### 4. Get 80G Certificate
```
GET /api/donations/{id}/certificate
```

### Payment Gateway Configuration

#### Razorpay Integration (Recommended for India)
```typescript
const razorpayOptions = {
  key: process.env.RAZORPAY_KEY_ID,
  amount: amount * 100, // Convert to paise
  currency: 'INR',
  name: 'Ziddi Mumbaikar',
  description: fundraiserData.title,
  order_id: orderId,
  handler: function (response) {
    verifyPayment(response)
  },
  prefill: {
    name: donorName,
    email: donorEmail,
    contact: donorPhone
  },
  theme: {
    color: '#f0750a' // Primary color
  }
}
```

### Email Templates

#### Donation Confirmation
- Subject: "Thank you for your donation to [Fundraiser Title]"
- Content:
  - Donation amount
  - Transaction ID
  - Fundraiser details
  - Receipt link
  - 80G certificate (if applicable)

#### Fundraiser Update (to creator)
- Subject: "You received a new donation!"
- Content:
  - Donor name (or Anonymous)
  - Amount donated
  - Updated total raised
  - Thank supporter option

## Database Schema Reference

Related tables from `database-schema.md`:

### `donations`
- id (UUID, PK)
- fundraiser_id (FK)
- donor_user_id (FK, nullable)
- donor_name
- donor_email
- donor_phone
- amount (decimal)
- payment_method
- transaction_id
- is_anonymous
- tax_certificate_generated
- status

### `fundraisers`
- raised_amount (update on donation)
- total_supporters (increment on donation)

### `tax_certificates`
- donation_id (FK)
- certificate_number
- issued_date
- pdf_url

## Testing Checklist

### Modal Functionality
- [ ] Modal opens on "Donate Now" click
- [ ] Modal closes on backdrop click
- [ ] Modal closes on X button click
- [ ] Form resets after successful donation

### Amount Selection
- [ ] Predefined amounts selectable
- [ ] Custom amount input works
- [ ] Selecting predefined clears custom
- [ ] Entering custom deselects predefined
- [ ] Minimum amount validation (₹100)
- [ ] Amount displays correctly in footer

### Donor Information
- [ ] Anonymous checkbox toggles fields
- [ ] All fields required when not anonymous
- [ ] Email validation
- [ ] Phone number max length (10 digits)

### Payment Methods
- [ ] All three methods selectable
- [ ] Only one method selected at a time
- [ ] Selected method highlighted

### Form Validation
- [ ] Error shown for amount < ₹100
- [ ] Error shown for missing fields
- [ ] Error clears on correction
- [ ] Submit disabled without amount
- [ ] Submit disabled during loading

### Responsive Design
- [ ] Modal works on mobile
- [ ] Form fields usable on small screens
- [ ] Amount buttons fit on mobile
- [ ] Scrollable on small viewports

### Visual States
- [ ] Loading state during submission
- [ ] Success confirmation after donation
- [ ] Error display for failures
- [ ] Selected states clear
- [ ] Hover effects working

## Security Considerations

### Client-Side
- Input validation
- Amount tampering prevention
- XSS prevention in form fields

### Server-Side
- Payment signature verification
- Amount validation
- Duplicate transaction prevention
- Rate limiting on donation endpoints

### PCI Compliance
- No card details stored on server
- Payment gateway handles sensitive data
- HTTPS required for all transactions

## Analytics Events

Track the following events:

1. **Donation Modal Opened**
   - fundraiser_id
   - fundraiser_title

2. **Amount Selected**
   - selected_amount
   - is_custom

3. **Payment Method Selected**
   - method: upi | card | netbanking

4. **Donation Attempted**
   - amount
   - payment_method
   - is_anonymous

5. **Donation Completed**
   - amount
   - payment_method
   - transaction_id
   - is_anonymous

6. **Donation Failed**
   - amount
   - error_code
   - error_message

## Future Enhancements

1. **Recurring Donations**
   - Monthly/weekly donation options
   - Auto-debit setup
   - Subscription management

2. **Donor Dashboard**
   - View all donations
   - Download receipts
   - Tax summary at year-end

3. **Social Sharing**
   - Share donation on social media
   - Challenge friends to donate
   - Leaderboards

4. **Corporate Matching**
   - Employer matching programs
   - Corporate donor verification
   - Bulk donations

5. **Payment Options**
   - Wallet integration (Paytm, PhonePe)
   - International payments
   - Cryptocurrency donations

6. **Donation Incentives**
   - Badges for donors
   - Recognition levels
   - Special perks for large donations

7. **Offline Donations**
   - Cash donation recording
   - Cheque/DD acceptance
   - Bank transfer tracking

8. **Gift Donations**
   - Donate in someone's name
   - Send greeting with donation
   - Bulk gift donations

## File Locations

- **Detail Page with Modal**: `/src/app/fundraisers/[id]/page.tsx`
- **Listing Page**: `/src/app/fundraisers/page.tsx`
- **Documentation**: `/docs/donation-flow.md`

## Related Documentation

- Database Schema: `/docs/database-schema.md`
- Fundraiser Creation: `/docs/fundraiser-creation-flow.md`
- Payment Gateway Integration: (TODO)
- Tax Certificate Generation: (TODO)
