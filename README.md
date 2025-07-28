# 🍕 Domino's Coupons Finder

A modern web application for finding and managing Domino's Pizza store coupons. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **Store Locator**: Find nearby Domino's locations or search by store number
- **Coupon Browser**: View available deals and promotions for any store
- **Email Coupons**: Send selected coupons directly to your email
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, accessible interface with Domino's brand styling
- **Real-time Updates**: Live coupon availability and store information

## 🚀 Live Demo

Visit the app: [https://dominos.techbrew.dev](https://dominos.techbrew.dev)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **API Integration**: Domino's Pizza API
- **Email Service**: Resend API
- **Deployment**: Vercel
- **Code Quality**: ESLint + TypeScript strict mode

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dunkindash/dominos-coupons.git
cd dominos-coupons
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_sender_email@domain.com
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🌟 Key Features

### Store Search
- Search by store number for quick access
- Find nearby stores using location services
- View store details including hours and contact info

### Coupon Management
- Browse all available deals for selected stores
- Filter and sort coupons by category or value
- Toggle between grid and list view layouts

### Email Integration
- Select multiple coupons to email
- Professional email templates with coupon details
- Secure delivery with rate limiting protection

### Accessibility
- WCAG AA compliant design
- Keyboard navigation support
- Screen reader optimized
- High contrast color schemes

## 🔐 Security Features

- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- XSS prevention
- Secure environment variable handling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure accessibility compliance
- Add tests for new features
- Update documentation as needed

## 📝 API Reference

The app integrates with:
- **Domino's Pizza API**: For store and coupon data
- **Resend API**: For email delivery services

## 🚀 Deployment

This app is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Domino's Pizza for their API
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ by [TechBrew, Inc.](https://github.com/dunkindash)