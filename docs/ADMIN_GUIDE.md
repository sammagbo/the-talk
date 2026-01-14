# Admin Guide - THE TALK

This guide explains how to use Supabase Studio as your admin dashboard.

## Accessing Supabase Studio

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. You now have access to the full admin panel

## Available Analytics Views

Run these queries in **SQL Editor** for insights:

### Live Listeners
```sql
SELECT * FROM live_listeners ORDER BY listener_count DESC;
```

### User Growth
```sql
SELECT * FROM admin_user_growth LIMIT 30;
```

### Episode Engagement
```sql
SELECT * FROM admin_episode_engagement 
ORDER BY rating_count DESC LIMIT 20;
```

### Daily Activity Summary
```sql
SELECT * FROM admin_daily_activity;
```

## Managing Users

**Table Editor → users**
- View/edit user profiles
- Check badges and language preferences

## Content Moderation

**Table Editor → comments**
- Review recent comments
- Delete inappropriate content

## Managing Admins

To add a new admin:
```sql
INSERT INTO admins (user_id, role, created_by)
VALUES ('user-uuid-here', 'moderator', 'your-uuid');
```

Roles: `admin`, `moderator`, `analyst`

## Cleanup Stale Presence

Run periodically to clean old presence records:
```sql
SELECT cleanup_stale_presence();
```

Or set up a Supabase cron job for automatic cleanup.
