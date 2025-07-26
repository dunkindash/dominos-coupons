# Design Document

## Overview

The email coupon feature will allow users to send selected coupons from the Domino's Coupons Finder application to their email address. The feature integrates seamlessly with the existing React application and leverages Vercel serverless functions for email delivery. Users will receive professionally styled HTML emails containing coupon details, store information, and branding consistent with the Domino's theme.

## Architecture

### Frontend Components
- **EmailCouponsButton**: A new component that triggers the email functionality
- **EmailModal**: A modal dialog for email input and coupon selection
- **CouponSelector**: Checkbox interface for selecting specific coupons to email

### Backend Services
- **Email API Endpoint**: New Vercel serverless function at `/api/email/send-coupons`
- **Email Template Engine**: HTML template generation for coupon emails
- **Email Service Provider**: Integration with a transactional email service (Resend or SendGrid)

### Data Flow
1. User views coupons and clicks "Email Coupons" button
2. Modal opens showing email input and coupon selection interface
3. User selects desired coupons and enters email address
4. Frontend validates input and sends request to email API
5. Backend generates HTML email template with selected coupons
6. Email service provider delivers the email
7. User receives confirmation of successful send

## Components and Interfaces

### Frontend Components

#### EmailCouponsButton Component
```typescript
interface EmailCouponsButtonProps {
  coupons: Coupon[]
  storeInfo: StoreInfo | null
  disabled?: boolean
}
```

**Responsibilities:**
- Display email button when coupons are available
- Handle button click to open email modal
- Show loading state during email sending
- Display success/error messages

#### EmailModal Component
```typescript
interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  coupons: Coupon[]
  storeInfo: StoreInfo | null
  onSendEmail: (email: string, selectedCoupons: Coupon[]) => Promise<void>
}
```

**Responsibilities:**
- Render modal dialog with email form
- Validate email address format
- Manage coupon selection state
- Handle form submission
- Display progress and result feedback

#### CouponSelector Component
```typescript
interface CouponSelectorProps {
  coupons: Coupon[]
  selectedCoupons: string[]
  onSelectionChange: (selectedIds: string[]) => void
}
```

**Responsibilities:**
- Render checkbox list of available coupons
- Show coupon preview (name, code, price)
- Handle selection/deselection
- Provide "Select All" / "Deselect All" functionality

### Backend API

#### Email API Endpoint
**Endpoint:** `POST /api/email/send-coupons`

**Request Body:**
```typescript
interface SendCouponsRequest {
  email: string
  coupons: Coupon[]
  storeInfo: StoreInfo
  language?: string
}
```

**Response:**
```typescript
interface SendCouponsResponse {
  success: boolean
  message: string
  emailId?: string
}
```

**Responsibilities:**
- Validate email address and request data
- Apply rate limiting (reuse existing rate limit system)
- Generate HTML email template
- Send email via email service provider
- Return success/error response

## Data Models

### Email Template Data
```typescript
interface EmailTemplateData {
  recipientEmail: string
  coupons: Coupon[]
  storeInfo: StoreInfo
  timestamp: string
  language: string
  brandColors: {
    primary: string
    secondary: string
    accent: string
  }
}
```

### Email Configuration
```typescript
interface EmailConfig {
  fromEmail: string
  fromName: string
  replyTo: string
  subject: string
  templateId?: string
}
```

## Error Handling

### Frontend Error Scenarios
- **Invalid Email Format**: Show inline validation error
- **No Coupons Selected**: Prevent form submission with warning message
- **Network Errors**: Display retry option with error message
- **Rate Limit Exceeded**: Show rate limit message with reset time
- **Email Service Unavailable**: Display service unavailable message

### Backend Error Scenarios
- **Invalid Request Data**: Return 400 with validation errors
- **Rate Limit Exceeded**: Return 429 with rate limit headers
- **Email Service Failure**: Return 500 with generic error message
- **Authentication Issues**: Return 401 for invalid tokens

### Error Response Format
```typescript
interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
}
```

## Testing Strategy

### Unit Tests
- **Email validation logic**: Test various email formats
- **Coupon selection logic**: Test selection/deselection functionality
- **Template generation**: Test HTML email template rendering
- **Rate limiting**: Test rate limit enforcement and reset

### Integration Tests
- **Email API endpoint**: Test full request/response cycle
- **Email delivery**: Test with email service provider sandbox
- **Frontend integration**: Test modal workflow and state management
- **Error handling**: Test various error scenarios

### End-to-End Tests
- **Complete email workflow**: From button click to email receipt
- **Multi-coupon selection**: Test with various coupon combinations
- **Mobile responsiveness**: Test on different screen sizes
- **Email client compatibility**: Test email rendering across clients

## Security Considerations

### Data Protection
- **Email addresses**: Not stored permanently, only used for sending
- **Rate limiting**: Prevent abuse of email sending functionality
- **Input validation**: Sanitize all user inputs before processing
- **Authentication**: Reuse existing JWT token validation

### Email Security
- **SPF/DKIM records**: Configure proper email authentication
- **Unsubscribe handling**: Include unsubscribe mechanism if required
- **Content filtering**: Ensure email content passes spam filters
- **Privacy compliance**: Include privacy notice in emails

## Performance Considerations

### Frontend Optimization
- **Lazy loading**: Load email modal components only when needed
- **Debounced validation**: Avoid excessive email validation calls
- **Optimistic UI**: Show immediate feedback while processing
- **Caching**: Cache email templates and configurations

### Backend Optimization
- **Template caching**: Cache compiled email templates
- **Batch processing**: Handle multiple coupon selections efficiently
- **Connection pooling**: Optimize email service API connections
- **Response compression**: Compress API responses

## Email Template Design

### HTML Structure
- **Responsive design**: Mobile-first approach with media queries
- **Domino's branding**: Use brand colors (#006491, #E31837, #FFFFFF)
- **Accessibility**: Proper alt text, semantic HTML, high contrast
- **Email client compatibility**: Table-based layout for older clients

### Content Sections
1. **Header**: Domino's logo and "Your Coupons" title
2. **Store Information**: Store ID, address, business date
3. **Coupon Cards**: Individual coupon details with styling
4. **Footer**: Timestamp, disclaimer, unsubscribe link

### Styling Approach
- **Inline CSS**: Ensure compatibility across email clients
- **Fallback fonts**: Web-safe font stack
- **Color contrast**: Meet WCAG accessibility guidelines
- **Print-friendly**: Optimize for printing if needed

## Integration Points

### Existing Systems
- **Authentication**: Reuse existing JWT token system
- **Rate limiting**: Extend current rate limiting implementation
- **Error handling**: Follow existing error response patterns
- **Styling**: Use existing Tailwind CSS classes where applicable

### External Services
- **Email Provider**: Resend.com for transactional emails
- **Environment variables**: Store API keys and configuration
- **Monitoring**: Log email sending success/failure rates
- **Analytics**: Track email feature usage (optional)

## Deployment Considerations

### Environment Configuration
- **API Keys**: Secure storage of email service credentials
- **Rate limits**: Configurable limits per environment
- **Email templates**: Version control for template changes
- **Feature flags**: Ability to enable/disable email feature

### Monitoring and Logging
- **Email delivery rates**: Track successful/failed sends
- **Error tracking**: Monitor and alert on email failures
- **Performance metrics**: Track email generation and send times
- **User feedback**: Collect success/error feedback from users