*Expense Tracker – Take control of your finances, one transaction at a time.*

## Author
**Unmesh Arya**  
Full-Stack Developer with a strong passion for building robust, scalable, and user-centric web applications. With over a year of hands-on experience in modern technologies including Node.js, Express.js, MongoDB, React.js, and Next.js, I specialize in delivering high-quality solutions that make a real impact.  

Creator & Developer of Expense Tracker.  
Always open to feedback, suggestions, and exciting collaboration opportunities!


# Expense Tracker

A modern, full-stack web application for tracking personal expenses and income, visualizing spending habits, and managing your financial health. Built with Next.js, React, MongoDB, and Tailwind CSS, this project offers a seamless and secure experience for users to monitor and analyze their finances.

## Features

- **User Authentication**: Secure sign up, login, and session management using NextAuth.js.
- **Transaction Management**: Add, edit, and delete income or expense transactions with categories and descriptions.
- **Analytics Dashboard**:
  - **Balance Over Time**: Interactive line chart to visualize your financial balance across week, month, or year.
  - **Expenses by Category**: Doughnut chart to analyze spending distribution.
  - **Recent Transactions**: List of your latest financial activities with quick edit/delete options.
- **Responsive UI**: Clean, mobile-friendly interface with light/dark theme toggle.
- **Tech Stack**: Next.js, React, MongoDB (via Mongoose), Tailwind CSS, Chart.js, NextAuth.js.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) database (local or cloud)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add your MongoDB connection string:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     NEXTAUTH_SECRET=your_nextauth_secret
     ```

### Running the Development Server
```bash
npm run dev
# or
yarn dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm start
```

## Usage
- **Sign Up**: Create a new account with your name, email, and password.
- **Login**: Access your dashboard securely.
- **Add Transactions**: Record income or expenses, categorize them, and add descriptions.
- **View Analytics**: Use the dashboard to see trends and breakdowns of your finances.
- **Edit/Delete**: Update or remove transactions as needed.
- **Switch Theme**: Toggle between light and dark mode for your preferred viewing experience.

## Deployment
This app can be easily deployed to [Vercel](https://vercel.com/) or any platform supporting Next.js. Ensure your environment variables are set in the deployment dashboard.

## Technologies Used
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)

## License
This project is licensed under the MIT License.

---


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
