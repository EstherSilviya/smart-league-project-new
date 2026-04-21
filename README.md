# Smart League — React + Firebase App

## 🚀 Setup in 5 Steps

### 1. Install dependencies
```bash
cd smart-league-app
npm install
```

### 2. Connect your Firebase project
Open `src/firebase/config.js` and replace the placeholder values with your Firebase project config:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Where to find this:**
Firebase Console → Your Project → Project Settings → Your Apps → Web → SDK setup and configuration

### 3. Enable Firebase services
In your Firebase Console, enable:
- **Authentication** → Sign-in method → Email/Password ✅
- **Firestore Database** → Create database (start in test mode, then apply rules)
- **Storage** → Get started

### 4. Deploy Firestore security rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# copy contents of firestore.rules into your project
firebase deploy --only firestore:rules
```

### 5. Run the app
```bash
npm start
```

---

## 📁 Project Structure

```
src/
├── firebase/
│   ├── config.js          ← 🔑 Your Firebase keys go here
│   ├── firestore.js       ← All database operations
│   └── storageService.js  ← Image upload helpers
│
├── contexts/
│   └── AuthContext.js     ← Auth state + role detection
│
├── components/
│   └── Layout.jsx         ← TopBar, BottomNav, Sidebar, ProtectedRoute
│
├── pages/
│   ├── auth/
│   │   └── Auth.jsx       ← Login, Signup, ForgotPassword
│   │
│   ├── student/
│   │   ├── HomeFeed.jsx           ← Discovery feed (real-time)
│   │   ├── StudentProfile.jsx     ← Profile + edit + avatar upload
│   │   └── ExploreAchievements.jsx ← Browse + filter achievements
│   │
│   ├── teacher/
│   │   └── TeacherDashboard.jsx   ← Teacher home + student list
│   │
│   ├── admin/
│   │   ├── AdminDashboard.jsx     ← Stats + recent activity
│   │   ├── AdminStudentsList.jsx  ← Search/sort all students
│   │   ├── AdminAchievements.jsx  ← Assign achievement + student detail
│   │   ├── AdminNews.jsx          ← News list + full editor
│   │   ├── AdminUsers.jsx         ← User management + role assignment
│   │   └── AdminCriteriaEditor.jsx ← Achievement criteria builder
│   │
│   └── shared/
│       └── StudentSpotlight.jsx   ← Student of the Moment
│
├── App.jsx     ← All routes + role-based redirects
└── index.js    ← Entry point
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Student** | Feed, Explore, own Profile |
| **Teacher** | + Teacher Dashboard, assign achievements, publish news |
| **Admin** | Full access — all admin pages, user management |

**First admin setup:** After signing up, manually set your role to `admin` in Firestore:
- Firebase Console → Firestore → `users` collection → your document → set `role: "admin"`

---

## 🔥 Firebase Collections

| Collection | Description |
|------------|-------------|
| `users` | All user profiles (uid as doc id) |
| `achievements` | Student achievements |
| `news` | News posts and publications |
| `achievementCriteria` | Achievement templates/criteria |

---

## 🏗️ Build for production
```bash
npm run build
```

Then deploy the `build/` folder to Firebase Hosting, Vercel, or Netlify.

---

## 💡 Tips

- All images upload to Firebase Storage with progress tracking
- Role changes take effect immediately (real-time from Firestore)
- The app uses real-time listeners for feed and achievements
- Teachers can assign achievements and publish news (same as admin, without user management)
