# Fundraiser Creation Flow

## Overview
This document describes the fundraiser creation feature that allows logged-in users to raise fund requests on the Ziddi Mumbaikar platform.

## User Journey

### 1. Access Control
- **Public Access**: "Start a Fundraiser" button visible in navigation (both desktop and mobile)
- **Authentication Required**: Users must be logged in to create a fundraiser
- **Redirect Flow**: Non-logged-in users are redirected to `/signin?redirect=/fundraiser/start`

### 2. Sign In Process
When users try to access the fundraiser creation page without being logged in:
1. They are redirected to the sign-in page
2. A notification appears: "🔒 You need to sign in to start a fundraiser"
3. After successful sign-in, they are redirected back to the fundraiser creation page

### 3. Fundraiser Creation Steps

#### Step 1: Select Category
Users choose from 8 categories:
- 🏥 Medical Treatment (Surgery, treatment, hospitalization)
- 📚 Education (School fees, college tuition, courses)
- 🆘 Disaster Relief (Natural disasters, emergencies)
- 🏘️ Community Development (Cleanliness, infrastructure, local projects)
- 💊 Health & Wellness (Health camps, awareness programs)
- 👴 Senior Citizens (Elderly care and support)
- 👩 Women Safety (Women empowerment and safety)
- 🤝 Other Causes (Any other social cause)

**Validation**: Category must be selected to proceed

#### Step 2: Basic Details
Required fields:
- **Fundraiser Title**: Min 10 characters, max 100 characters
- **Target Amount**: Minimum ₹1,000
- **Required By Date**: Optional deadline date
- **Beneficiary Name**: Required
- **Your Relation to Beneficiary**: Self, Parent/Child, Spouse, Sibling, Relative, Friend, Organization/NGO, Other
- **Beneficiary Age**: Optional
- **Beneficiary Phone**: Optional, 10 digits

**Validation**: 
- Title length check
- Minimum amount validation
- Beneficiary name required

#### Step 3: Story & Description
Required fields:
- **Short Description**: Min 50 characters, max 200 characters (appears in listing)
- **Full Story**: Min 200 characters (complete background story)
- **Current Situation**: Optional detailed description
- **How Will The Funds Help**: Optional explanation of fund usage

**Validation**:
- Short description minimum length
- Full story minimum length

#### Step 4: Documents & Images
Upload capabilities:
- **Images**: Up to 5 images (PNG, JPG, GIF, max 10MB each)
  - Image preview with remove option
  - Drag and drop support
  
- **Supporting Documents**: Up to 10 documents (PDF, DOC, DOCX, JPG, PNG, max 10MB each)
  - Medical reports, bills, prescriptions, ID proof, etc.
  - Document list with remove option

**Location & Contact**:
- Locality (e.g., Andheri, Bandra)
- Pincode (6 digits)
- Contact Name
- Contact Phone (10 digits)

#### Step 5: Review & Submit
Final review includes:
- All entered information summary
- Eligibility settings:
  - Sadaqah
  - Zakat
  - Lillah
  - Bank Interest
  
- **Tax Benefits**: Checkbox to indicate 80G certificate eligibility
- **Terms & Conditions**: Must agree to proceed

**Validation**:
- Must agree to terms and conditions

## Features

### Progress Indicator
- Visual 5-step progress bar
- Shows current step, completed steps, and upcoming steps
- Step numbers change to checkmarks when completed

### Navigation
- **Next Step**: Validates current step before proceeding
- **Back**: Returns to previous step (available from step 2 onwards)
- **Scroll to Top**: Automatic scroll on step change

### Form State Management
All form data is maintained in a single state object with fields organized by step.

### File Handling
- Multiple file upload support
- Preview for images
- List view for documents
- Individual file removal
- File type validation
- Size limit enforcement

### Error Handling
- Field-level validation
- Step-level validation before proceeding
- Clear error messages
- Error display at top of form

## API Integration (TODO)

### Endpoint
```
POST /api/fundraisers
Content-Type: multipart/form-data
```

### Request Data
- All form fields as FormData
- Images: `image_0`, `image_1`, etc.
- Documents: `document_0`, `document_1`, etc.
- Eligibility array as JSON string

### Response
```json
{
  "success": true,
  "fundraiserId": "uuid",
  "status": "under_review",
  "message": "Fundraiser submitted successfully"
}
```

### Redirect After Success
```
/fundraisers?created=true
```
Shows success message: "Fundraiser Created Successfully! Your fundraiser has been submitted and is under review."

## Protected Route Implementation

### Current Implementation
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(true)

useEffect(() => {
  if (!isAuthenticated) {
    router.push('/signin?redirect=/fundraiser/start')
  }
}, [isAuthenticated, router])
```

### Production Implementation (TODO)
Replace with actual authentication check:
- JWT token validation
- Session verification
- API call to verify user session
- Check user permissions/roles

## Database Schema Reference

Related tables from `database-schema.md`:
- `fundraisers` - Main fundraiser data
- `fundraiser_documents` - Uploaded documents
- `fundraiser_updates` - Progress updates
- `fundraiser_beneficiaries` - Beneficiary information
- `fundraiser_categories` - Category master data

## File Locations

- **Page**: `/src/app/fundraiser/start/page.tsx`
- **Sign In**: `/src/app/signin/page.tsx`
- **Listing**: `/src/app/fundraisers/page.tsx`
- **Header**: `/src/components/Header.tsx`
- **Documentation**: `/docs/fundraiser-creation-flow.md`

## Testing Checklist

- [ ] Non-logged-in user redirect works
- [ ] Sign-in redirect parameter preserved
- [ ] All form validations working
- [ ] Image upload and preview
- [ ] Document upload and listing
- [ ] Step navigation (next/back)
- [ ] Progress indicator updates
- [ ] Form state persists across steps
- [ ] Error messages display correctly
- [ ] Success message shows after creation
- [ ] Mobile responsive design
- [ ] File size validation
- [ ] File type validation

## Future Enhancements

1. **Auto-save Draft**: Save progress to local storage or database
2. **Campaign Templates**: Pre-filled templates for common campaigns
3. **AI Story Helper**: Suggest improvements to fundraiser story
4. **Photo Compression**: Auto-compress large images
5. **Document OCR**: Extract information from uploaded documents
6. **Multi-language Support**: Create fundraiser in multiple languages
7. **Video Upload**: Support for video content
8. **Social Media Preview**: Preview how it will appear when shared
9. **Bank Account Verification**: Verify beneficiary bank details
10. **KYC Integration**: Automated KYC verification
