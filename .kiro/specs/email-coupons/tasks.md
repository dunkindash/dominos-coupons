# Implementation Plan

- [x] 1. Set up email service integration and backend API
  - Install and configure email service provider (Resend)
  - Create environment variables for email service configuration
  - Implement email API endpoint with rate limiting and authentication
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 1.1 Install email service dependencies
  - Add Resend package to package.json dependencies
  - Configure environment variables for email service API key
  - _Requirements: 3.2_

- [x] 1.2 Create email API endpoint structure
  - Create `/api/email/send-coupons.js` serverless function
  - Implement request validation for email and coupons data
  - Add authentication check using existing JWT token system
  - _Requirements: 3.1, 3.2_

- [x] 1.3 Implement rate limiting for email endpoint
  - Extend existing rate limiting system to email endpoint
  - Add rate limit headers to email API responses
  - Handle rate limit exceeded scenarios with appropriate error messages
  - _Requirements: 3.4_

- [x] 2. Create HTML email template generation
  - Build responsive HTML email template with Domino's branding
  - Implement template data injection for coupons and store information
  - Ensure email client compatibility and accessibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Design base HTML email template
  - Create responsive HTML structure using table-based layout
  - Apply Domino's brand colors and styling with inline CSS
  - Include header with logo, main content area, and footer sections
  - _Requirements: 2.2, 2.5_

- [x] 2.2 Implement coupon card template components
  - Create individual coupon card HTML structure
  - Include coupon name, code, description, price, and expiration date
  - Add conditional rendering for virtual codes and special offers
  - _Requirements: 2.1, 2.2_

- [x] 2.3 Add store information and metadata to template
  - Include store ID, address, and business date in email header
  - Add timestamp of when coupons were retrieved
  - Include disclaimer and footer information
  - _Requirements: 2.3, 2.5_

- [x] 3. Implement email sending functionality in API
  - Complete email API endpoint with template generation
  - Integrate with Resend service for email delivery
  - Add comprehensive error handling and logging
  - _Requirements: 3.2, 3.3, 3.5_

- [x] 3.1 Complete email API endpoint implementation
  - Process POST request with email address and selected coupons
  - Generate HTML email using template with provided data
  - Send email via Resend service and handle response
  - _Requirements: 3.2, 3.3_

- [x] 3.2 Add comprehensive error handling to email API
  - Handle email service failures with appropriate error messages
  - Validate email format and coupon data on server side
  - Return structured error responses with proper HTTP status codes
  - _Requirements: 3.3, 3.5_

- [x] 4. Create frontend email button component
  - Build EmailCouponsButton component with loading states
  - Integrate with existing coupon display in App.tsx
  - Handle button click to trigger email modal
  - _Requirements: 1.1, 1.5_

- [x] 4.1 Create EmailCouponsButton component
  - Build React component with TypeScript interfaces
  - Add button styling consistent with existing Domino's theme
  - Implement disabled state when no coupons are available
  - _Requirements: 1.1, 1.5_

- [x] 4.2 Integrate email button into main App component
  - Add EmailCouponsButton to coupon display section in App.tsx
  - Pass current coupons and store information as props
  - Position button appropriately in the UI layout
  - _Requirements: 1.1, 1.5_

- [x] 5. Create email modal and coupon selection interface
  - Build EmailModal component with form validation
  - Implement CouponSelector component for choosing specific coupons
  - Add email address input with client-side validation
  - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4_

- [x] 5.1 Create EmailModal component structure
  - Build modal dialog component with overlay and form
  - Add email input field with validation styling
  - Implement modal open/close functionality and state management
  - _Requirements: 1.2, 1.3_

- [x] 5.2 Implement CouponSelector component
  - Create checkbox interface for individual coupon selection
  - Display coupon preview with name, code, and price
  - Add "Select All" and "Deselect All" functionality
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5.3 Add email validation and form submission
  - Implement client-side email format validation
  - Prevent form submission when no coupons are selected
  - Show validation errors and success/failure messages
  - _Requirements: 1.3, 4.4_

- [x] 6. Implement email sending workflow and state management
  - Connect frontend modal to email API endpoint
  - Add loading states and success/error feedback
  - Handle API responses and display appropriate messages
  - _Requirements: 1.4, 1.5, 3.3, 3.5_

- [x] 6.1 Create email sending service function
  - Implement API call to send-coupons endpoint
  - Handle authentication token and request formatting
  - Process API response and extract success/error information
  - _Requirements: 1.4, 3.3_

- [x] 6.2 Integrate email sending with modal component
  - Connect form submission to email sending service
  - Add loading spinner and disable form during sending
  - Display success confirmation or error messages to user
  - _Requirements: 1.5, 3.5_

- [x] 6.3 Add email feature state management to App component
  - Manage email modal open/close state in main App component
  - Handle email sending success/error states
  - Update UI to show email feature availability based on coupons
  - _Requirements: 1.5, 3.5_

- [x] 7. Add responsive design and mobile optimization
  - Ensure email modal works properly on mobile devices
  - Optimize email template for mobile email clients
  - Test and adjust responsive behavior across screen sizes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7.1 Implement responsive modal design
  - Add mobile-friendly modal sizing and positioning
  - Ensure touch-friendly button sizes and spacing
  - Test modal functionality on various mobile screen sizes
  - _Requirements: 5.1, 5.2_

- [x] 7.2 Optimize email template for mobile clients
  - Add media queries for mobile email client optimization
  - Ensure coupon cards stack properly on small screens
  - Test email rendering in popular mobile email apps
  - _Requirements: 5.3, 5.5_

- [x] 8. Add comprehensive error handling and user feedback
  - Implement proper error messages for all failure scenarios
  - Add retry functionality for failed email sends
  - Ensure consistent error handling across the feature
  - _Requirements: 3.3, 3.5_

- [x] 8.1 Implement frontend error handling
  - Add error state management to email modal component
  - Display user-friendly error messages for different failure types
  - Provide retry button for recoverable errors
  - _Requirements: 3.3, 3.5_

- [x] 8.2 Add success feedback and confirmation
  - Show success message when email is sent successfully
  - Clear form and close modal after successful send
  - Provide confirmation with sent email address
  - _Requirements: 1.5_

- [x] 9. Create unit tests for email functionality
  - Write tests for email validation logic
  - Test coupon selection and template generation
  - Add tests for API endpoint functionality
  - _Requirements: All requirements - testing coverage_

- [x] 9.1 Write frontend component tests
  - Test EmailCouponsButton component rendering and interactions
  - Test EmailModal component form validation and submission
  - Test CouponSelector component selection logic
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3_

- [x] 9.2 Write backend API tests
  - Test email API endpoint with valid and invalid requests
  - Test rate limiting functionality for email endpoint
  - Test email template generation with various coupon data
  - _Requirements: 3.1, 3.2, 3.4, 2.1, 2.2, 2.3_

- [x] 10. Final integration and testing
  - Test complete email workflow from button click to email receipt
  - Verify email delivery and template rendering
  - Test error scenarios and edge cases
  - _Requirements: All requirements - end-to-end validation_

- [x] 10.1 Perform end-to-end workflow testing
  - Test complete user journey from coupon selection to email receipt
  - Verify email template renders correctly in multiple email clients
  - Test with various coupon combinations and store information
  - _Requirements: All requirements_

- [x] 10.2 Test error scenarios and edge cases
  - Test behavior with invalid email addresses and network failures
  - Verify rate limiting works correctly across multiple requests
  - Test modal behavior with no coupons and empty selections
  - _Requirements: 3.3, 3.4, 3.5, 4.2_