# Gaming Lobby Frontend

A React TypeScript frontend for the Django Premium Chat Lobby system with real-time chat, premium user features, and comprehensive moderation interface.

## Features

### 🔐 Authentication
- User registration and login
- JWT token management with auto-refresh
- Protected routes for authenticated users
- Premium user verification

### 🏠 Lobby Management
- Browse and search public lobbies
- Create lobbies (Premium users only)
- Join/leave lobbies
- Real-time lobby status updates
- Owner controls (start game, close lobby)

### 💬 Real-time Chat
- WebSocket-based real-time messaging
- Typing indicators
- Message history
- Online user presence
- Message deletion (own messages)

### 👥 User Management
- Member list with roles (Owner, Moderator, Member)
- Premium user badges
- Online status indicators

### 🛡️ Moderation Interface
- Kick/ban users with reasons
- Promote/demote moderators
- Transfer ownership
- Unban users
- Comprehensive moderation logging

### 🎨 UI/UX
- Dark theme gaming interface
- Responsive design for all devices
- Loading states and error handling
- Premium user styling
- Tailwind CSS styling

## Tech Stack

- **React 18** with TypeScript
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **Socket.IO** for real-time communication
- **Context API** for state management

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat system components
│   ├── common/         # Reusable UI components
│   ├── lobby/          # Lobby management components
│   └── moderation/     # Moderation interface
├── contexts/           # React Context providers
├── services/           # API and WebSocket services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Django backend running on http://localhost:8001

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update `.env` with your backend URLs:
```
REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_WS_URL=ws://localhost:8001
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## API Integration

The frontend integrates with the Django backend through:

### REST API Endpoints
- Authentication: `/api/auth/`
- User management: `/api/me/`
- Lobby operations: `/api/lobbies/`
- Message handling: `/api/lobbies/{id}/messages/`
- Moderation actions: `/api/lobbies/{id}/kick/`, `/ban/`, etc.

### WebSocket Events
- Real-time messaging
- User join/leave notifications
- Typing indicators
- Lobby status updates

## Key Components

### Authentication Flow
- `LoginForm` and `RegisterForm` for user authentication
- `ProtectedRoute` for route protection
- `AuthContext` for global auth state

### Lobby System
- `LobbyList` displays available lobbies
- `LobbyCard` shows lobby information
- `CreateLobbyModal` for premium users
- `LobbyDetails` shows full lobby interface

### Chat System
- `ChatWindow` main chat interface
- `MessageList` displays chat history
- `MessageInput` for sending messages
- Real-time WebSocket integration

### Moderation
- `MembersList` shows lobby members
- `ModerationModal` handles moderation actions
- Role-based permission system

## Features by User Type

### Regular Users
- Browse public lobbies
- Join available lobbies
- Participate in chat
- Leave lobbies

### Premium Users
- All regular user features
- Create new lobbies
- Customize lobby settings
- Priority support indicators

### Lobby Owners
- All premium user features
- Full lobby management
- Moderation powers
- Transfer ownership
- Close/delete lobbies

### Moderators
- All regular user features
- Kick/ban users
- Delete messages
- Manage lobby order

## Responsive Design

The interface adapts to different screen sizes:
- **Desktop**: Full sidebar and chat layout
- **Tablet**: Collapsible navigation
- **Mobile**: Stack layout with optimized touch interactions

## Error Handling

Comprehensive error handling includes:
- Network error recovery
- Authentication failures
- WebSocket disconnections
- Rate limiting indicators
- User-friendly error messages

## Performance Optimizations

- Component lazy loading
- Message pagination
- Debounced search
- WebSocket connection management
- Efficient re-rendering with React hooks

## Security Features

- JWT token management
- Protected API calls
- XSS protection
- CSRF protection
- Input validation
- Role-based access control

## Browser Support

Supports modern browsers including:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set production API URLs in `.env.production`:
```
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_WS_URL=wss://your-api-domain.com
```

### Hosting
The built files in `build/` can be served by any static file server or CDN.

## License

This project is part of the Django Premium Chat Lobby system.
