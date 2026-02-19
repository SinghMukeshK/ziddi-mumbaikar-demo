# Service Pages Documentation

## Overview
Created individual service pages for each of the 6 main services offered by Ziddi Mumbaikar. Each page provides detailed information about the service, impact stats, and participation instructions.

## Service Pages Created

### 1. Cleanliness Drives
**Route**: `/services/cleanliness-drives`
**File**: `/src/app/services/cleanliness-drives/page.tsx`

**Features**:
- Green color theme (green-500 to emerald-600)
- Overview section explaining the service
- "What We Do" with 4 key activities:
  - Weekly Neighborhood Drives
  - Beach Cleanup Campaigns
  - Slum Area Sanitation
  - Public Space Maintenance
- Impact stats: 150+ Drives, 50 Tons Waste, 2000+ Volunteers
- How to Participate (3-step process)
- Sidebar with CTA, Quick Info, and Share buttons

### 2. Health Campaigns (TODO)
**Route**: `/services/health-campaigns`
**File**: `/src/app/services/health-campaigns/page.tsx`

**Planned Content**:
- Blue color theme
- Fogging services
- Health awareness programs
- Disease prevention initiatives
- Mobile health camps

### 3. Emergency Support (TODO)
**Route**: `/services/emergency-support`
**File**: `/src/app/services/emergency-support/page.tsx`

**Planned Content**:
- Red color theme
- 24/7 ambulance service
- First aid training
- Emergency response team
- Medical equipment support

### 4. Community Events (TODO)
**Route**: `/services/community-events`
**File**: `/src/app/services/community-events/page.tsx`

**Planned Content**:
- Purple/Pink color theme
- Women safety workshops
- Self-defense training
- Community gatherings
- Empowerment programs

### 5. Local Assistance (TODO)
**Route**: `/services/local-assistance`
**File**: `/src/app/services/local-assistance/page.tsx`

**Planned Content**:
- Orange color theme
- Elderly care programs
- Disaster relief
- Infrastructure support
- Neighborhood help

### 6. Environmental Action (TODO)
**Route**: `/services/environmental-action`
**File**: `/src/app/services/environmental-action/page.tsx`

**Planned Content**:
- Teal/Green color theme
- Tree plantation drives
- Waste management
- Sustainability workshops
- Green initiatives

## Page Structure Template

Each service page follows this structure:

### 1. Header
- Breadcrumb navigation (Home › Services › Service Name)
- Hero section with colored gradient background
- Service icon and title
- Tagline/description

### 2. Main Content (2/3 width)
- **Overview Section**: Detailed introduction to the service
- **What We Do Section**: List of specific activities with checkmark icons
- **Impact Stats**: 3 key metrics in colored card
- **How to Participate**: Step-by-step guide (1, 2, 3)

### 3. Sidebar (1/3 width)
- **CTA Card**: 
  - "Join Our Next [Service]" heading
  - Description
  - Primary action button (Register/Sign Up)
  - Secondary button (Contact Us)
- **Quick Info Card**:
  - Schedule (timing)
  - Location coverage
  - Eligibility
  - Cost
- **Share Card**:
  - Facebook share
  - WhatsApp share

### 4. Footer
- Standard Footer component

## Design Features

### Color Themes
Each service has its own color scheme matching the WhatWeDo cards:
- Cleanliness: Green (#10b981 to #059669)
- Health: Blue (#3b82f6 to #06b6d4)
- Emergency: Red (#ef4444 to #f43f5e)
- Community: Purple (#a855f7 to #ec4899)
- Local: Orange (#f97316 to #f59e0b)
- Environmental: Teal (#14b8a6 to #10b981)

### Visual Elements
- Gradient hero backgrounds
- Icon containers with matching colors
- Checkmark bullets for features
- Numbered steps for participation
- Stat counters with large bold numbers
- Sticky sidebar on desktop
- Rounded corners (rounded-2xl)
- Shadow effects on cards

### Responsive Design
- 3-column layout on desktop (2 cols content + 1 col sidebar)
- Stacks to single column on mobile
- Sticky sidebar on desktop (top-24)
- Breadcrumb navigation collapses gracefully

## WhatWeDo Component Updates

### Changes Made
1. Added `'use client'` directive for client-side navigation
2. Imported `Link` from `next/link`
3. Added `link` property to each service object
4. Updated "Learn More" from `<div>` to `<Link>` component

### Service Links
```typescript
{
  title: "Cleanliness Drives",
  link: "/services/cleanliness-drives",
  // ... other properties
}
```

### Navigation
- Clicking "Learn More" on any service card navigates to its dedicated page
- Hover effects still work with Link component
- Arrow animation on hover

## Next Steps

To complete all service pages, create the remaining 5 pages using the template:

### Quick Creation Checklist
For each service page:
1. ✅ Copy the cleanliness-drives/page.tsx template
2. ✅ Update color theme (bg-gradient, text colors, button colors)
3. ✅ Update icon in hero section
4. ✅ Change title and tagline
5. ✅ Write unique overview content
6. ✅ List 4-5 "What We Do" activities
7. ✅ Update impact statistics
8. ✅ Adjust "How to Participate" steps
9. ✅ Update Quick Info sidebar details
10. ✅ Update CTA button text if needed

### Files to Create
```
src/app/services/
├── cleanliness-drives/
│   └── page.tsx ✅ DONE
├── health-campaigns/
│   └── page.tsx ⏳ TODO
├── emergency-support/
│   └── page.tsx ⏳ TODO
├── community-events/
│   └── page.tsx ⏳ TODO
├── local-assistance/
│   └── page.tsx ⏳ TODO
└── environmental-action/
    └── page.tsx ⏳ TODO
```

## Integration Points

### Navigation
- Homepage Hero buttons link to volunteer/contact
- WhatWeDo section "Learn More" links to service pages
- Service page breadcrumbs link back to home and services section
- Service page CTAs link to volunteer registration and contact

### Cross-Page Links
- All service pages link to `/volunteer` for registration
- All service pages link to `/contact` for inquiries
- Breadcrumb navigation maintains context

## SEO Considerations

Each page should have:
- Unique page title
- Meta description
- OG tags for social sharing
- Semantic HTML structure
- Descriptive headings (H1, H2, H3)

Example metadata:
```typescript
export const metadata = {
  title: 'Cleanliness Drives | Ziddi Mumbaikar',
  description: 'Join our community-led cleanup drives across Mumbai. Making the city cleaner one neighborhood at a time.',
}
```

## Analytics Tracking

Recommended events to track:
- Service page view
- "Register Now" button click
- "Contact Us" button click
- Social share button clicks
- "Learn More" clicks from homepage

## Accessibility

All pages include:
- Proper heading hierarchy
- Alt text for icons (via ARIA)
- Keyboard navigation support
- Color contrast compliance
- Focus states on interactive elements

## Performance

Optimization techniques:
- Static page generation (SSG)
- Image optimization with Next.js Image
- Minimal client-side JavaScript
- CSS-only animations
- Lazy loading for below-fold content
