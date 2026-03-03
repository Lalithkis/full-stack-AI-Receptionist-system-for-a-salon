# StyleCut Salon Website

A modern, professional hair salon website built with React and Tailwind CSS.

## Features

- ✨ Clean, minimalist design with navy blue and gold color scheme
- 📱 Fully mobile responsive
- 🏠 Home page with hero section and services overview
- 💇 Services page with detailed pricing
- 👥 Team page featuring 3 professional stylists (Sarah, Mike, Jessica)
- 📞 Contact page with booking form, business hours, and location
- 🎨 Smooth navigation and modern UI/UX

## Tech Stack

- **React** - Frontend framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling and responsive design
- **Create React App** - Project setup

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd stylecut-salon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and visit:
```
http://localhost:3000
```

## Project Structure

```
stylecut-salon/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.js       # Navigation bar component
│   │   └── Footer.js       # Footer component
│   ├── pages/
│   │   ├── Home.js         # Home page
│   │   ├── Services.js     # Services and pricing
│   │   ├── Team.js         # Team members
│   │   └── Contact.js      # Contact and booking form
│   ├── App.js              # Main app component with routing
│   ├── index.css           # Global styles with Tailwind
│   └── index.js            # Entry point
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

## Pages

### Home Page
- Hero section with call-to-action
- Services overview with icons
- Why Choose Us section with benefits
- Call-to-action section

### Services Page
- Comprehensive service listings
- Detailed pricing for all services
- Service categories: Haircuts, Coloring, Styling & Treatments, Special Services
- Service information and policies

### Team Page
- Meet the stylists: Sarah, Mike, and Jessica
- Professional experience and specialties
- Detailed bios for each team member
- Book with your favorite stylist CTA

### Contact Page
- Interactive booking form
- Contact information (phone, email, location)
- Business hours
- Form validation

## Customization

### Colors
The color scheme is defined in `tailwind.config.js`:
- Navy: #0a1929, #1a2332, #1e293b
- Gold: #fbbf24, #f59e0b, #d97706

### Content
Update the content in the page files:
- Team members: `src/pages/Team.js`
- Services and pricing: `src/pages/Services.js`
- Contact information: `src/pages/Contact.js` and `src/components/Footer.js`

## Build for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `build/` directory.

## Available Scripts

### `npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, please contact info@stylecutsalon.com
