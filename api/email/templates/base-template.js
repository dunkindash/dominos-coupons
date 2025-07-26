/**
 * @fileoverview Base HTML email template for Domino's coupons
 * Provides responsive, accessible email template with Domino's branding
 */

// Email template configuration
const EMAIL_CONFIG = {
  colors: {
    primary: '#006491',    // Domino's blue
    secondary: '#E31837',  // Domino's red
    accent: '#FFFFFF',     // White
    text: '#333333',       // Dark gray
    lightGray: '#F5F5F5',  // Light gray background
    border: '#DDDDDD'      // Border gray
  },
  fonts: {
    primary: 'Arial, Helvetica, sans-serif',
    fallback: 'sans-serif'
  },
  layout: {
    maxWidth: '600px',
    padding: {
      header: '30px 20px',
      content: '30px 20px',
      footer: '20px'
    }
  }
}

// Backward compatibility
const BRAND_COLORS = EMAIL_CONFIG.colors

/**
 * HTML sanitization utility with improved type safety
 * @param {string|number|null|undefined} text - Text to sanitize
 * @returns {string} Sanitized HTML
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return ''

  // Handle numbers and other primitive types
  const str = typeof text === 'string' ? text : String(text)

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Validates template data structure
 * @param {Object} data - Template data to validate
 * @throws {Error} If required data is missing
 */
function validateTemplateData(data) {
  if (!data) throw new Error('Template data is required')
  if (!data.recipientEmail) throw new Error('Recipient email is required')
  if (!data.coupons) throw new Error('Coupons data is required')
  if (!data.storeInfo) throw new Error('Store information is required')
  if (!data.timestamp) throw new Error('Timestamp is required')
  if (!data.storeInfo.StoreID) throw new Error('Store ID is required')
}

/**
 * Generates email CSS styles
 * @returns {string} CSS styles for email template
 */
function generateEmailStyles() {
  return `
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    
    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: ${BRAND_COLORS.lightGray};
      font-family: Arial, Helvetica, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: ${BRAND_COLORS.text};
    }
    
    /* Container styles */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${BRAND_COLORS.accent};
    }
    
    /* Header styles */
    .header {
      background-color: ${BRAND_COLORS.primary};
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: ${BRAND_COLORS.accent};
      font-size: 28px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .header .subtitle {
      margin: 10px 0 0 0;
      color: ${BRAND_COLORS.accent};
      font-size: 16px;
      opacity: 0.9;
    }
    
    /* Content styles */
    .content {
      padding: 30px 20px;
    }
    .intro-text {
      margin: 0 0 25px 0;
      font-size: 16px;
      line-height: 1.5;
    }
    
    /* Store info styles */
    .store-info {
      background-color: ${BRAND_COLORS.lightGray};
      border-left: 4px solid ${BRAND_COLORS.secondary};
      padding: 15px 20px;
      margin: 0 0 25px 0;
      border-radius: 0 4px 4px 0;
    }
    .store-info h3 {
      margin: 0 0 10px 0;
      color: ${BRAND_COLORS.primary};
      font-size: 18px;
    }
    .store-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    /* Footer styles */
    .footer {
      background-color: ${BRAND_COLORS.lightGray};
      padding: 20px;
      text-align: center;
      border-top: 1px solid ${BRAND_COLORS.border};
    }
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #666666;
    }
    .footer .timestamp {
      font-weight: bold;
      color: ${BRAND_COLORS.primary};
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .header {
        padding: 20px 15px !important;
      }
      .header h1 {
        font-size: 24px !important;
      }
      .content {
        padding: 20px 15px !important;
      }
      .store-info {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
    }
    
    /* Coupon card styles */
    .coupons-container {
      margin: 20px 0;
    }
    .coupon-card {
      transition: box-shadow 0.2s ease;
    }
    .coupon-price {
      font-size: 24px;
      font-weight: bold;
      color: ${BRAND_COLORS.secondary};
      margin-top: 5px;
    }
    .special-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background-color: ${BRAND_COLORS.secondary};
      color: ${BRAND_COLORS.accent};
      font-size: 11px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 0 6px 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Mobile coupon optimizations */
    @media only screen and (max-width: 600px) {
      .coupon-card {
        padding: 15px !important;
      }
      .coupon-name {
        font-size: 18px !important;
      }
      .coupon-price {
        font-size: 20px !important;
      }
      .code-value {
        font-size: 16px !important;
        padding: 6px 10px !important;
      }
    }
    
    /* Accessibility improvements */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
      border: 0;
    }
  `
}

/**
 * Generates the base HTML email template structure
 * @param {Object} data - Template data
 * @param {string} data.recipientEmail - Recipient email address
 * @param {Array<Object>} data.coupons - Array of coupon objects
 * @param {Object} data.storeInfo - Store information object
 * @param {string} data.storeInfo.StoreID - Store ID
 * @param {string} [data.storeInfo.AddressDescription] - Store address
 * @param {string} [data.storeInfo.BusinessDate] - Business date
 * @param {string} data.timestamp - Timestamp when coupons were retrieved
 * @returns {string} Complete HTML email template
 */
function generateBaseTemplate(data) {
  validateTemplateData(data)
  const { coupons, storeInfo, timestamp } = data

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Your Domino's Coupons</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${generateEmailStyles()}
  </style>
</head>
<body>
  <div role="article" aria-roledescription="email" aria-label="Your Domino's Coupons" lang="en">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
            
            <!-- Header -->
            <tr>
              <td class="header">
                <h1>🍕 Your Domino's Coupons</h1>
                <p class="subtitle">Great deals delivered to your inbox</p>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td class="content">
                <p class="intro-text">
                  Hello! Here are your selected coupons, ready to save you money on your next Domino's order.
                </p>
                
                <!-- Store Information Section -->
                ${generateStoreInfoSection(storeInfo)}
                
                <!-- Coupons Section -->
                <div role="region" aria-label="Available Coupons">
                  ${generateCouponsSection(coupons)}
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  <strong>How to use:</strong> Present these coupon codes when ordering online, by phone, or in-store. 
                  Some restrictions may apply. Check individual coupon terms for details.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td class="footer">
                ${generateFooterSection(timestamp)}
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
}

/**
 * Generates the store information section with comprehensive metadata
 * @param {Object} storeInfo - Store information object
 * @returns {string} HTML for store info section
 */
function generateStoreInfoSection(storeInfo) {
  if (!storeInfo || !storeInfo.StoreID) {
    return ''
  }

  const storeId = escapeHtml(storeInfo.StoreID)
  const address = storeInfo.AddressDescription ? escapeHtml(storeInfo.AddressDescription) : ''
  const businessDate = storeInfo.BusinessDate ? escapeHtml(storeInfo.BusinessDate) : ''
  const phone = storeInfo.Phone ? escapeHtml(storeInfo.Phone) : ''
  const marketName = storeInfo.MarketName ? escapeHtml(storeInfo.MarketName) : ''
  const storeCoordinates = storeInfo.StoreCoordinates?.Description ?
    escapeHtml(storeInfo.StoreCoordinates.Description) : ''

  // Store status information
  const isOpen = storeInfo.IsOpen
  const isOnlineCapable = storeInfo.IsOnlineCapable
  const isDeliveryStore = storeInfo.IsDeliveryStore
  const serviceHours = storeInfo.ServiceHours

  // Format store hours if available
  let hoursDisplay = ''
  if (serviceHours && serviceHours.Delivery) {
    const deliveryHours = serviceHours.Delivery
    hoursDisplay = `
      <div style="margin-top: 10px; font-size: 13px;">
        <strong>Delivery Hours:</strong><br>
        ${Object.entries(deliveryHours).map(([day, hours]) =>
      `<span style="display: inline-block; width: 80px;">${day}:</span> ${hours || 'Closed'}`
    ).join('<br>')}
      </div>
    `
  }

  // Store status badges
  let statusBadges = ''
  if (isOpen) {
    statusBadges += `<span class="status-badge open" style="
      background-color: #28a745;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 5px;
      text-transform: uppercase;
    ">Open</span>`
  }
  if (isOnlineCapable) {
    statusBadges += `<span class="status-badge online" style="
      background-color: ${BRAND_COLORS.primary};
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 5px;
      text-transform: uppercase;
    ">Online Ordering</span>`
  }
  if (isDeliveryStore) {
    statusBadges += `<span class="status-badge delivery" style="
      background-color: ${BRAND_COLORS.secondary};
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 5px;
      text-transform: uppercase;
    ">Delivery</span>`
  }

  return `
    <div class="store-info" style="
      background: linear-gradient(135deg, ${BRAND_COLORS.lightGray} 0%, #f8f9fa 100%);
      border-left: 4px solid ${BRAND_COLORS.secondary};
      padding: 20px;
      margin: 0 0 25px 0;
      border-radius: 0 8px 8px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    ">
      <h3 style="
        margin: 0 0 15px 0;
        color: ${BRAND_COLORS.primary};
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        📍 Store Information
      </h3>
      
      <div style="margin-bottom: 15px;">
        <div style="font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.text}; margin-bottom: 5px;">
          Store #${storeId}
        </div>
        ${statusBadges ? `<div style="margin-bottom: 10px;">${statusBadges}</div>` : ''}
      </div>
      
      ${address || storeCoordinates ? `
        <div style="margin-bottom: 10px;">
          <strong>📍 Address:</strong><br>
          <span style="color: #555;">${address || storeCoordinates}</span>
        </div>
      ` : ''}
      
      ${phone ? `
        <div style="margin-bottom: 10px;">
          <strong>📞 Phone:</strong> 
          <a href="tel:${phone}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">${phone}</a>
        </div>
      ` : ''}
      
      ${marketName ? `
        <div style="margin-bottom: 10px;">
          <strong>🏪 Market:</strong> <span style="color: #555;">${marketName}</span>
        </div>
      ` : ''}
      
      ${businessDate ? `
        <div style="margin-bottom: 10px;">
          <strong>📅 Business Date:</strong> <span style="color: #555;">${businessDate}</span>
        </div>
      ` : ''}
      
      ${hoursDisplay}
      
      <div style="
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid ${BRAND_COLORS.border};
        font-size: 12px;
        color: #666;
      ">
        <em>💡 Tip: Call ahead to confirm availability and any special promotions not listed here.</em>
      </div>
    </div>
  `
}

/**
 * Generates the coupons section with individual coupon cards
 * @param {Array} coupons - Array of coupon objects
 * @returns {string} HTML for coupons section
 */
function generateCouponsSection(coupons) {
  if (!coupons || coupons.length === 0) {
    return `
      <div style="text-align: center; padding: 40px 20px; color: #666;">
        <p>No coupons available at this time.</p>
      </div>
    `
  }

  return `
    <h2 style="color: ${BRAND_COLORS.primary}; font-size: 22px; margin: 0 0 20px 0; border-bottom: 2px solid ${BRAND_COLORS.secondary}; padding-bottom: 10px;">
      🎟️ Your Coupons (${coupons.length})
    </h2>
    <div class="coupons-container">
      ${coupons.map(coupon => generateCouponCard(coupon)).join('')}
    </div>
  `
}

/**
 * Extracts and formats coupon data for template rendering
 * @param {Object} coupon - Raw coupon object
 * @returns {Object} Formatted coupon data
 */
function formatCouponData(coupon) {
  return {
    name: escapeHtml(coupon.Name || 'Unnamed Coupon'),
    code: escapeHtml(coupon.Code || coupon.VirtualCode || 'No Code'),
    description: escapeHtml(coupon.Description || ''),
    price: escapeHtml(coupon.Price || coupon.BundlePrice || ''),
    expirationDate: escapeHtml(coupon.ExpirationDate || ''),
    priceInfo: escapeHtml(coupon.PriceInfo || ''),
    isVirtualCode: coupon.VirtualCode && !coupon.Code,
    isSpecialOffer: coupon.Tags && (
      coupon.Tags.toLowerCase().includes('special') ||
      coupon.Tags.toLowerCase().includes('limited') ||
      coupon.Tags.toLowerCase().includes('exclusive')
    )
  }
}

/**
 * Generates price display HTML
 * @param {string} price - Price string
 * @returns {string} HTML for price display
 */
function generatePriceDisplay(price) {
  if (!price) return ''
  const formattedPrice = price.startsWith('$') ? price : `$${price}`
  return `<div class="coupon-price">${formattedPrice}</div>`
}

/**
 * Generates special offer badge HTML
 * @param {boolean} isSpecialOffer - Whether this is a special offer
 * @returns {string} HTML for special badge
 */
function generateSpecialBadge(isSpecialOffer) {
  return isSpecialOffer ? `<div class="special-badge">⭐ Special Offer</div>` : ''
}

/**
 * Generates coupon code section HTML
 * @param {string} code - Coupon code
 * @param {boolean} isVirtualCode - Whether this is a virtual code
 * @returns {string} HTML for code section
 */
function generateCodeSection(code, isVirtualCode) {
  const codeLabel = isVirtualCode ? 'Virtual Code' : 'Coupon Code'

  return `
    <div class="coupon-code-section" style="
      background-color: ${BRAND_COLORS.lightGray};
      border: 1px dashed ${BRAND_COLORS.primary};
      border-radius: 4px;
      padding: 12px;
      margin: 15px 0;
      text-align: center;
    ">
      <div class="code-label" style="
        font-size: 12px;
        color: ${BRAND_COLORS.primary};
        font-weight: bold;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">${codeLabel}</div>
      <div class="code-value" style="
        font-family: 'Courier New', Courier, monospace;
        font-size: 18px;
        font-weight: bold;
        color: ${BRAND_COLORS.text};
        background-color: ${BRAND_COLORS.accent};
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid ${BRAND_COLORS.border};
        display: inline-block;
        letter-spacing: 1px;
      ">${code}</div>
    </div>
  `
}

/**
 * Generates coupon footer with additional info
 * @param {string} priceInfo - Price information
 * @param {string} expirationDate - Expiration date
 * @returns {string} HTML for coupon footer
 */
function generateCouponFooter(priceInfo, expirationDate) {
  return `
    <div class="coupon-footer" style="
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid ${BRAND_COLORS.border};
      font-size: 12px;
      color: #666;
    ">
      ${priceInfo ? `<div style="margin-bottom: 5px;"><strong>Details:</strong> ${priceInfo}</div>` : ''}
      ${expirationDate ? `<div><strong>Expires:</strong> ${expirationDate}</div>` : ''}
      ${!expirationDate ? '<div><em>Check with store for expiration details</em></div>' : ''}
    </div>
  `
}

/**
 * Generates an individual coupon card
 * @param {Object} coupon - Coupon object
 * @returns {string} HTML for individual coupon card
 */
function generateCouponCard(coupon) {
  const data = formatCouponData(coupon)
  const priceDisplay = generatePriceDisplay(data.price)
  const specialBadge = generateSpecialBadge(data.isSpecialOffer)
  const codeSection = generateCodeSection(data.code, data.isVirtualCode)
  const footer = generateCouponFooter(data.priceInfo, data.expirationDate)

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
      <tr>
        <td>
          <div class="coupon-card" style="
            border: 2px solid ${BRAND_COLORS.border};
            border-radius: 8px;
            padding: 20px;
            background-color: ${BRAND_COLORS.accent};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
          ">
            ${specialBadge}
            
            <!-- Coupon Header -->
            <div class="coupon-header" style="margin-bottom: 15px;">
              <h3 class="coupon-name" style="
                margin: 0 0 5px 0;
                color: ${BRAND_COLORS.secondary};
                font-size: 20px;
                font-weight: bold;
                line-height: 1.3;
              ">${data.name}</h3>
              ${priceDisplay}
            </div>
            
            ${codeSection}
            
            <!-- Description -->
            ${data.description ? `
              <div class="coupon-description" style="
                margin: 15px 0;
                font-size: 14px;
                line-height: 1.5;
                color: ${BRAND_COLORS.text};
              ">${data.description}</div>
            ` : ''}
            
            ${footer}
          </div>
        </td>
      </tr>
    </table>
  `
}

/**
 * Generates the footer section with disclaimer and metadata
 * @param {string} timestamp - Timestamp when coupons were retrieved
 * @returns {string} HTML for footer section
 */
function generateFooterSection(timestamp) {
  return `
    <div style="text-align: center;">
      <!-- Timestamp -->
      <div style="margin-bottom: 20px;">
        <p class="timestamp" style="
          font-size: 14px;
          font-weight: bold;
          color: ${BRAND_COLORS.primary};
          margin: 0 0 5px 0;
        ">
          📅 Retrieved on: ${escapeHtml(timestamp)}
        </p>
        <p style="font-size: 12px; color: #666; margin: 0;">
          Coupon availability and terms may change. Please verify with store before ordering.
        </p>
      </div>
      
      <!-- Application Info -->
      <div style="margin-bottom: 20px;">
        <p style="font-size: 13px; color: ${BRAND_COLORS.text}; margin: 0 0 10px 0;">
          This email was generated by the <strong>Domino's Coupons Finder</strong> application.
        </p>
        <p style="margin: 0;">
          <a href="https://dominos.com" style="
            color: ${BRAND_COLORS.primary};
            text-decoration: none;
            font-weight: bold;
            padding: 8px 16px;
            border: 2px solid ${BRAND_COLORS.primary};
            border-radius: 4px;
            display: inline-block;
            transition: all 0.2s ease;
          ">
            🍕 Visit Domino's Official Website
          </a>
        </p>
      </div>
      
      <!-- Usage Instructions -->
      <div style="
        background-color: #f8f9fa;
        border: 1px solid ${BRAND_COLORS.border};
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 20px;
        text-align: left;
      ">
        <h4 style="
          margin: 0 0 10px 0;
          color: ${BRAND_COLORS.primary};
          font-size: 14px;
          text-align: center;
        ">📋 How to Use Your Coupons</h4>
        <ul style="
          margin: 0;
          padding-left: 20px;
          font-size: 12px;
          color: #555;
          line-height: 1.5;
        ">
          <li>Present coupon codes when ordering online at dominos.com</li>
          <li>Mention codes when calling your local Domino's store</li>
          <li>Show this email when ordering in-store</li>
          <li>Check expiration dates and terms before ordering</li>
          <li>Some coupons cannot be combined with other offers</li>
        </ul>
      </div>
      
      <!-- Legal Disclaimer -->
      <div style="
        border-top: 2px solid ${BRAND_COLORS.border};
        padding-top: 15px;
        margin-top: 20px;
      ">
        <p style="font-size: 11px; color: #999; margin: 0 0 8px 0; line-height: 1.4;">
          <strong>Disclaimer:</strong> Domino's® and the Domino's logo are registered trademarks of Domino's IP Holder LLC.
          This application is not affiliated with, endorsed by, or sponsored by Domino's Pizza.
        </p>
        <p style="font-size: 11px; color: #999; margin: 0 0 8px 0; line-height: 1.4;">
          Coupon terms, availability, and pricing are subject to change without notice.
          Please verify all offers with your local Domino's store before placing an order.
        </p>
        <p style="font-size: 11px; color: #999; margin: 0; line-height: 1.4;">
          This email contains promotional information. If you no longer wish to receive these emails,
          please discontinue using the Domino's Coupons Finder application.
        </p>
      </div>
      
      <!-- Privacy Notice -->
      <div style="
        margin-top: 15px;
        padding: 10px;
        background-color: #e8f4f8;
        border-radius: 4px;
        border-left: 3px solid ${BRAND_COLORS.primary};
      ">
        <p style="font-size: 10px; color: #555; margin: 0; line-height: 1.3;">
          🔒 <strong>Privacy:</strong> Your email address is used only to deliver this coupon information
          and is not stored or shared with third parties.
        </p>
      </div>
    </div>
  `
}

export {
  generateBaseTemplate,
  generateStoreInfoSection,
  generateCouponsSection,
  generateCouponCard,
  generateFooterSection,
  escapeHtml,
  BRAND_COLORS
}