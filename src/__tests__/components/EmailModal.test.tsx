import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import EmailModal from '@/components/EmailModal'
import { sendCouponsEmail } from '@/lib/email-utils'
import type { Coupon, StoreInfo } from '@/types/dominos'

// Mock the email utils
vi.mock('@/lib/email-utils', () => ({
  sendCouponsEmail: vi.fn(),
  getErrorMessage: vi.fn((error) => error.message || 'Unknown error'),
  validateEmailWithFeedback: vi.fn((email) => ({
    isValid: email.includes('@'),
    error: email.includes('@') ? undefined : 'Invalid email format'
  }))
}))

const mockCoupons: Coupon[] = [
  {
    ID: '1',
    Name: 'Large Pizza Deal',
    Description: 'Get a large pizza for $9.99',
    Code: 'LARGE999',
    Price: '9.99'
  },
  {
    ID: '2',
    Name: 'Wings Special',
    Description: '10 wings for $7.99',
    Code: 'WINGS799',
    VirtualCode: 'ONLINE799',
    Price: '7.99'
  }
]

const mockStoreInfo: StoreInfo = {
  StoreID: '7046',
  AddressDescription: '123 Main St',
  BusinessDate: '2024-01-15',
  Phone: '555-0123'
}

describe('EmailModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    coupons: mockCoupons,
    storeInfo: mockStoreInfo
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders when open', () => {
    render(<EmailModal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Email Coupons - Store #7046')).toBeInTheDocument()
    expect(screen.getByText('2 coupons available')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<EmailModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('displays email input field', () => {
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('displays coupon selector with all coupons', () => {
    render(<EmailModal {...defaultProps} />)
    
    expect(screen.getByText('Large Pizza Deal')).toBeInTheDocument()
    expect(screen.getByText('Wings Special')).toBeInTheDocument()
    expect(screen.getByText('Code: LARGE999')).toBeInTheDocument()
    expect(screen.getByText('Code: WINGS799')).toBeInTheDocument()
  })

  it('validates email format on blur', async () => {
    const user = userEvent.setup()
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    
    await user.type(emailInput, 'invalid-email')
    await user.tab() // Trigger blur
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('shows error when no coupons are selected', async () => {
    const user = userEvent.setup()
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send.*coupon/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please select at least one coupon/i)).toBeInTheDocument()
    })
  })

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup()
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const firstCoupon = screen.getAllByRole('checkbox')[1] // Skip "Select All" checkbox
    const submitButton = screen.getByRole('button', { name: /send.*coupon/i })
    
    // Initially disabled
    expect(submitButton).toBeDisabled()
    
    await user.type(emailInput, 'test@example.com')
    await user.click(firstCoupon)
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockSendEmail = vi.mocked(sendCouponsEmail)
    mockSendEmail.mockResolvedValue({
      success: true,
      message: 'Email sent successfully',
      emailId: 'test-id'
    })
    
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const firstCoupon = screen.getAllByRole('checkbox')[1]
    const submitButton = screen.getByRole('button', { name: /send.*coupon/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(firstCoupon)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSendEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        coupons: [mockCoupons[0]],
        storeInfo: mockStoreInfo,
        language: 'en'
      })
    })
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()
    const mockSendEmail = vi.mocked(sendCouponsEmail)
    mockSendEmail.mockResolvedValue({
      success: true,
      message: 'Email sent successfully',
      emailId: 'test-id'
    })
    
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const firstCoupon = screen.getAllByRole('checkbox')[1]
    const submitButton = screen.getByRole('button', { name: /send.*coupon/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(firstCoupon)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email sent successfully/i)).toBeInTheDocument()
    })
  })

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup()
    const mockSendEmail = vi.mocked(sendCouponsEmail)
    mockSendEmail.mockRejectedValue(new Error('Network error'))
    
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const firstCoupon = screen.getAllByRole('checkbox')[1]
    const submitButton = screen.getByRole('button', { name: /send.*coupon/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(firstCoupon)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    
    render(<EmailModal {...defaultProps} onClose={mockOnClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close modal/i })
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    
    render(<EmailModal {...defaultProps} onClose={mockOnClose} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal on escape key press', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    
    render(<EmailModal {...defaultProps} onClose={mockOnClose} />)
    
    await user.keyboard('{Escape}')
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('prevents closing modal during submission', async () => {
    const user = userEvent.setup()
    const mockSendEmail = vi.mocked(sendCouponsEmail)
    const mockOnClose = vi.fn()
    
    // Make the email sending hang
    mockSendEmail.mockImplementation(() => new Promise(() => {}))
    
    render(<EmailModal {...defaultProps} onClose={mockOnClose} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const firstCoupon = screen.getAllByRole('checkbox')[1]
    const submitButton = screen.getByRole('button', { name: /send.*coupon/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(firstCoupon)
    await user.click(submitButton)
    
    // Try to close during submission
    await user.keyboard('{Escape}')
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockSendEmail = vi.mocked(sendCouponsEmail)
    
    // Make the email sending hang
    mockSendEmail.mockImplementation(() => new Promise(() => {}))
    
    render(<EmailModal {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const firstCoupon = screen.getAllByRole('checkbox')[1]
    const submitButton = screen.getByRole('button', { name: /send.*coupon/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(firstCoupon)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })
  })

  it('handles select all functionality', async () => {
    const user = userEvent.setup()
    render(<EmailModal {...defaultProps} />)
    
    const selectAllButton = screen.getByRole('button', { name: /select all/i })
    const checkboxes = screen.getAllByRole('checkbox')
    
    // Click select all
    await user.click(selectAllButton)
    
    // All coupon checkboxes should be checked (skip the first one which is select all)
    checkboxes.slice(1).forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
    
    // Button should now say "Deselect All"
    expect(screen.getByRole('button', { name: /deselect all/i })).toBeInTheDocument()
  })

  it('updates coupon count in submit button', async () => {
    const user = userEvent.setup()
    render(<EmailModal {...defaultProps} />)
    
    const firstCoupon = screen.getAllByRole('checkbox')[1]
    const secondCoupon = screen.getAllByRole('checkbox')[2]
    
    // Initially shows 0 coupons
    expect(screen.getByRole('button', { name: /send 0 coupons/i })).toBeInTheDocument()
    
    // Select first coupon
    await user.click(firstCoupon)
    expect(screen.getByRole('button', { name: /send 1 coupon$/i })).toBeInTheDocument()
    
    // Select second coupon
    await user.click(secondCoupon)
    expect(screen.getByRole('button', { name: /send 2 coupons/i })).toBeInTheDocument()
  })
})