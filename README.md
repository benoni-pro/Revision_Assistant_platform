# 🎓 Revision Assistant Platform

A comprehensive AI-powered learning platform designed to transform the educational experience through personalization, collaboration, and intelligent progress tracking.

## 🌟 Features

### ✅ Currently Available
- **Modern Authentication System** - Secure JWT-based authentication with password strength validation
- **Interactive Dashboard** - Real-time study statistics, progress tracking, and personalized recommendations
- **Responsive Design** - Mobile-first design that works seamlessly across all devices
- **Professional UI/UX** - Built with React, TypeScript, and Tailwind CSS for modern aesthetics
- **Real-time Capabilities** - Socket.IO integration for live collaboration features
- **Comprehensive Backend API** - RESTful API with robust error handling and validation

### 🚧 Coming Soon
- **Study Groups** - Collaborative learning spaces with real-time chat and resource sharing
- **Adaptive Quizzes** - AI-powered quiz system that adapts to your learning style
- **Progress Analytics** - Detailed insights into your learning journey with visual charts
- **AI Recommendations** - Personalized study suggestions based on your performance
- **Resource Library** - Centralized hub for study materials and resources

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **React Router Dom** for client-side routing
- **Axios** for API communication
- **React Hook Form** with Yup validation
- **Headless UI** for accessible components

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email services
- **Express Rate Limit** for API protection

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/revision_assistant
   
   # JWT Secrets (generate strong secrets)
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-refresh-token-secret-here
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # RapidAPI (Balancing Studies)
   RAPIDAPI_BALANCING_STUDIES_KEY=your-rapidapi-key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 📱 Application Overview

### Landing Page
- Modern, responsive design with smooth animations
- Feature highlights and platform benefits
- Clear call-to-action for registration and login

### Authentication
- Secure login and registration forms
- Password strength validation
- Email verification system
- Password reset functionality

### Dashboard
- **Study Statistics**: Daily/weekly study time, streaks, and goals
- **Recent Activity**: Timeline of your learning activities
- **Upcoming Tasks**: Scheduled quizzes and deadlines
- **AI Recommendations**: Personalized suggestions for improvement
- **Progress Visualization**: Charts and graphs of your learning journey

### Navigation
- **Collapsible Sidebar**: Easy access to all platform features
- **Mobile-Friendly**: Responsive menu for mobile devices
- **User Profile**: Quick access to settings and account management

## 🎨 Design Philosophy

- **User-Centric**: Every feature is designed with the learner's needs in mind
- **Accessibility**: WCAG compliant components for inclusive learning
- **Performance**: Optimized for fast loading and smooth interactions
- **Scalability**: Architecture designed to grow with user needs

## 🔧 Development

### Available Scripts

**Backend**:
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run lint` - Check code style

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code style

### Project Structure

```
Revision_Assistant_platform/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Main server file
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript definitions
│   │   ├── utils/          # Helper functions
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## 🔗 Balancing Studies Integration (RapidAPI)

- Backend proxy endpoint: `GET /api/resources/balancing-studies`
- Query params:
  - `path` (optional): appended to the upstream URL, e.g. `topics` or `categories/math`
  - Any additional query params are forwarded, e.g. `subject=math&level=beginner`
- Requires auth (Bearer). Backend uses `RAPIDAPI_BALANCING_STUDIES_KEY`.

Frontend example:

```ts
import { fetchBalancingStudies } from 'frontend/src/services/balancingStudiesService';

const data = await fetchBalancingStudies({ path: 'topics', subject: 'math' });
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Authentication system
- [x] Dashboard with basic analytics
- [x] Responsive design
- [x] Real-time infrastructure

### Phase 2 (Next)
- [ ] Study Groups implementation
- [ ] Quiz system with AI adaptation
- [ ] Advanced progress analytics
- [ ] Resource management system

### Phase 3 (Future)
- [ ] Mobile application
- [ ] AI-powered study planning
- [ ] Integration with external learning platforms
- [ ] Advanced collaboration tools

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](#-quick-start)
2. Search existing [issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information
4. Join our community discussions

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for personalized education
- Thanks to all contributors and the open-source community

---

**Made with ❤️ for learners everywhere**
