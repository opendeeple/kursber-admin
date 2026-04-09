# Kursber Admin Panel - Setup Guide

## Initial Setup

The admin panel includes a setup page that allows you to create the first super admin account easily.

### How to Create Super Admin

1. **Navigate to the Setup Page**
   - Open your browser and go to: `http://localhost:5173/setup` (or your production URL + `/setup`)
   - Or click the "Setup sahifasiga o'ting" link on the login page

2. **Fill in Admin Details**
   - **To'liq ism** (Full Name): Enter the admin's full name
   - **Email**: Enter a valid email address (this will be used for login)
   - **Parol** (Password): Enter a secure password (minimum 6 characters)

3. **Create Account**
   - Click "Super Admin yaratish" button
   - The system will:
     - Create a user account in Supabase Auth
     - Add the user to the `admin_users` table
     - Redirect you to the login page

4. **Login**
   - Use the email and password you just created to log in

### Setup Page Security

The setup page includes built-in security features:

- **One-Time Setup**: The page automatically checks if any admin users already exist
- **Auto-Redirect**: If admins already exist, the page shows a "Setup tugallangan" (Setup Complete) message and provides a button to go to the login page
- **No Manual SQL Required**: Everything is handled automatically through the UI

### What Happens Behind the Scenes

When you create a super admin:

1. A new user is created in Supabase Auth (`auth.users` table)
2. The user's ID, email, and full name are automatically added to the `admin_users` table
3. Row Level Security (RLS) policies ensure only authenticated admins can access the panel

### Troubleshooting

**If you see "Setup tugallangan":**
- This means an admin user already exists
- Use the login page with existing credentials
- To reset, you'll need to manually delete users from the database

**If you get "Email confirmation may be required" error:**

This is the most common issue. Supabase requires email confirmation by default. To fix:

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** > **Providers** > **Email**
3. Scroll down to **Email Settings**
4. **Disable** the option "Confirm email"
5. Click "Save"
6. Try the setup again

Alternatively, you can:
- Check your email inbox for a confirmation link from Supabase
- Click the confirmation link
- Then manually add the user to the `admin_users` table using SQL

**If you get "Failed to create admin record" error:**
- This means the auth user was created but couldn't be added to `admin_users`
- Check the browser console for detailed error messages
- Verify RLS policies are correctly set up
- You may need to manually add the user to `admin_users` table (see Manual Setup below)

**General troubleshooting:**
- Check your Supabase connection in the `.env` file
- Verify your Supabase URL and anon key are correct
- Check browser console for detailed error messages
- Ensure you have a stable internet connection

**Database Access:**
- Go to your Supabase project dashboard
- Navigate to: Authentication > Users (to see auth users)
- Navigate to: Database > Tables > admin_users (to see admin records)

## Manual Setup (Alternative Method)

If you prefer manual setup or need to create additional admin users:

1. **Create Auth User** in Supabase Dashboard:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter email and password
   - Note the User ID

2. **Add to Admin Table** via SQL Editor:
   ```sql
   INSERT INTO admin_users (id, email, full_name)
   VALUES (
     'user-id-from-step-1',
     'admin@example.com',
     'Admin Name'
   );
   ```

## Next Steps

After creating your super admin:

1. Log in to the admin panel
2. Set up your payment apps in the "Ilovalar" section
3. Configure exchange rates in the "Kurslar" section
4. Adjust app settings in the "Sozlamalar" section
5. Monitor users and analytics in the dashboard

## Security Best Practices

- Use strong passwords for admin accounts
- Keep your Supabase credentials secure
- Regularly monitor the admin_users table for unauthorized access
- Consider implementing two-factor authentication for production
- Limit the number of super admin accounts
