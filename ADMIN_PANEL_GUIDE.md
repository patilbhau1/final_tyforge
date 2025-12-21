# 🛡️ Admin Panel Guide

## Overview

The TY Project Launchpad Admin Panel is a comprehensive control center for managing all aspects of the platform including users, projects, orders, meetings, and support requests.

## 🚀 Quick Start

### 1. Create Admin User

Before accessing the admin panel, ensure an admin user exists in the database:

```bash
cd backend_new
python create_admin.py
```

This will create/verify the admin user with credentials from your `.env` file.

### 2. Default Credentials (Development)

```
Email: admin@tyforge.com
Password: admin123
```

**⚠️ IMPORTANT:** Change these credentials in production by updating `backend_new/.env`:
```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Access Admin Panel

1. Start the backend: `.\start_backend.bat`
2. Start the frontend: `.\start_frontend.bat`
3. Navigate to: **http://localhost:8080/admin/login**
4. Login with admin credentials

## 📊 Features

### Dashboard Overview

The admin dashboard provides real-time statistics:
- **Total Users** - Number of registered users
- **Total Projects** - All project submissions
- **Total Orders** - Order statistics
- **Pending Synopsis** - Synopsis awaiting approval
- **Pending Requests** - Support tickets requiring attention

### 1. User Management

**Location:** Users Tab

**Features:**
- View all registered users
- See user details (name, email, phone, creation date)
- Identify admin users with badges
- Delete non-admin users
- View user activity

**Actions:**
- 👁️ View user details
- 🗑️ Delete user (non-admin only)

### 2. Project Management

**Location:** Projects Tab

**Features:**
- View all student projects
- See project titles and descriptions
- Track project status
- Monitor creation dates

**Actions:**
- 👁️ View project details

### 3. Order Management

**Location:** Orders Tab

**Features:**
- Track all plan purchases
- View order amounts and plans
- Monitor payment status
- See order history

**Status Types:**
- ✅ Completed - Payment successful
- ⏳ Pending - Awaiting payment
- ❌ Failed - Payment failed

**Actions:**
- 👁️ View order details

### 4. Meeting Management

**Location:** Meetings Tab

**Features:**
- View all scheduled meetings
- See meeting topics and dates
- Track meeting status
- Monitor upcoming/past meetings

**Actions:**
- 👁️ View meeting details

### 5. Admin Requests (Support Tickets)

**Location:** Requests Tab

**Features:**
- View all user support requests
- Read request messages
- Update request status
- Provide support

**Actions:**
- ⏱️ Mark as "In Progress"
- ✅ Mark as "Completed"
- ❌ Reject request

### 6. Synopsis Management

**Location:** Synopsis Tab

**Features:**
- Review submitted synopsis documents
- Approve or reject submissions
- Download synopsis files
- Track submission dates

**Status Types:**
- ✅ Approved
- ⏳ Pending
- ❌ Rejected

**Actions:**
- 👁️ View synopsis
- ✅ Approve synopsis

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Secure token storage
- Admin-only access control
- Automatic session expiration

### Authorization
- Backend validates admin status on every request
- Non-admin users cannot access admin endpoints
- Separate admin token storage

### Best Practices
1. **Change default credentials** before production
2. **Use strong passwords** (minimum 12 characters)
3. **Enable HTTPS** in production
4. **Regular security audits** of admin actions
5. **Limit admin access** to trusted personnel only

## 🎨 UI Features

### Design
- **Modern dark theme** with purple/pink gradients
- **Responsive layout** - works on desktop, tablet, mobile
- **Intuitive navigation** with tabbed interface
- **Real-time statistics** at a glance
- **Color-coded badges** for status indicators

### User Experience
- **Quick actions** - One-click status updates
- **Data tables** - Easy to scan information
- **Search & filter** (coming soon)
- **Bulk actions** (coming soon)
- **Export data** (coming soon)

## 📡 API Endpoints Used

All admin endpoints require authentication with admin privileges:

```
GET  /api/admin/stats              - Dashboard statistics
GET  /api/users/                   - All users
GET  /api/projects/all             - All projects
GET  /api/orders/all               - All orders
GET  /api/meetings/all             - All meetings
GET  /api/admin/requests           - Admin requests
PUT  /api/admin/requests/{id}      - Update request status
GET  /api/synopsis/all             - All synopsis
```

## 🛠️ Troubleshooting

### Cannot Login
1. Verify admin user exists: `python create_admin.py`
2. Check credentials in `.env` file
3. Ensure backend is running on port 8000
4. Check browser console for errors

### "Access Denied" Error
- User must have `is_admin=True` in database
- Run `create_admin.py` to set admin status

### Data Not Loading
1. Check backend is running and accessible
2. Verify CORS settings in `backend_new/app/main.py`
3. Check browser console for API errors
4. Ensure database connection is working

### 401 Unauthorized
- Token may have expired
- Logout and login again
- Clear browser localStorage

## 🔄 Workflow Examples

### Handling Support Request
1. Go to **Requests** tab
2. Read user's request message
3. Click "In Progress" to acknowledge
4. Resolve the issue
5. Click "Completed" to close ticket

### Approving Synopsis
1. Go to **Synopsis** tab
2. Click 👁️ to view the document
3. Review the content
4. Click ✅ to approve
5. User gets notified (future feature)

### Managing Users
1. Go to **Users** tab
2. Find the user in the table
3. Click 👁️ to view details
4. Click 🗑️ to delete if needed (non-admin only)

## 🚀 Future Enhancements

- [ ] Search and filter functionality
- [ ] Bulk actions (delete multiple, approve multiple)
- [ ] Export data to CSV/Excel
- [ ] Email notifications for admin actions
- [ ] Activity logs and audit trail
- [ ] User roles (super admin, moderator, etc.)
- [ ] Custom reports and analytics
- [ ] Real-time notifications
- [ ] Advanced user permissions

## 📞 Support

For admin panel issues or feature requests:
- Email: admin@tyforge.com
- Documentation: See project README
- Source Code: Check `src/pages/AdminDashboard.tsx`

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change admin credentials in `.env`
- [ ] Enable HTTPS
- [ ] Set strong SECRET_KEY in backend
- [ ] Restrict CORS to production domain only
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Test all admin functions
- [ ] Document admin procedures
- [ ] Train admin staff
- [ ] Set up 2FA (future)

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Status:** Production Ready ✅
