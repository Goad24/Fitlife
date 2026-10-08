# FitLife Updated Website

## Run
1. Extract this folder.
2. Open the folder in VS Code.
3. Right-click `index.html` -> Open with Live Server (or use your existing Go Live).
4. Register a user and open Dashboard.
5. Admin: `admin@fitlife.com` / `admin123`.

## Included
- Login/register
- Personalized planner with extra goals/preferences
- Health safeguards
- User plan storage
- Weight/measurement history
- Workout history
- Meal/water/workout reminders + browser notification permission
- Fitness store, cart and checkout
- Order tracking
- Admin product management
- Admin order status management
- Visitor counter
- Responsive professional UI

## Important
This version uses browser `localStorage` as the project database because it is designed to run with VS Code + Go Live and requires no backend software. Data is stored in that browser/device only. The admin dashboard therefore shows data created in the same browser.

For a real multi-user online website where every user's data is stored centrally and the admin can see visitors/orders from different devices, a real cloud database/backend (for example Firebase/Supabase) is required. That is not included here because you asked for no additional software/setup.

The account password is also only a college-project demo and is not secure for production.
