# Reviewer Test Guide — Healthcare Appointment Manager

Use this guide to test the complete application end-to-end after deployment.

This project has three roles:

- Patient
- Doctor
- Admin

## General testing rules

- Test each role in a separate browser session or incognito window
- Do not log into two different roles in the same browser profile at the same time

## Recommended test sequence

### 1. Authentication and routing

Test:

- Register a new patient
- Log in as patient
- Log in as doctor
- Log in as admin
- Confirm role-based redirects work
- Confirm each role lands on the correct dashboard

Expected:

- Patient goes to patient dashboard
- Doctor goes to doctor dashboard
- Admin goes to admin dashboard
- Unauthorized users are blocked from restricted pages

### 2. Patient portal

Test:

- Open patient dashboard
- Open patient doctors list
- Search for doctors
- Open a doctor detail page
- Book an appointment
- Choose a slot
- Submit symptoms
- Confirm booking
- Open patient appointments page
- Cancel an appointment if allowed

Expected:

- Doctors load correctly
- Booking creates an appointment
- Patient appointments page shows the new booking
- Cancel action updates the appointment status correctly

### 3. Doctor portal

Test:

- Open doctor dashboard
- Confirm today’s appointments load
- Open a specific appointment detail page
- Check that the pre-visit AI summary appears
- Add visit notes
- Complete the appointment
- Confirm the appointment status changes to completed

Expected:

- Doctor sees assigned appointments only
- Appointment detail loads correctly
- Pre-visit summary is visible
- Completing the visit saves notes and summary data

### 4. Admin portal

Test:

- Open admin dashboard
- Open doctors list
- Create a new doctor
- Open doctor detail page
- Edit doctor data
- Add a leave day
- Delete a leave day if supported
- Check admin appointments page
- Check admin notifications page

Expected:

- Admin can manage doctors successfully
- Leave management works
- Appointment and notification pages load properly
- Admin views show the expected records

### 5. Google Calendar integration

Test:

- Log in as a doctor
- Open the doctor dashboard
- Click Connect Google Calendar
- Complete OAuth sign-in
- Confirm redirect back to the app
- Check calendar connection status

Expected:

- Google OAuth completes without redirect errors
- Backend stores calendar tokens
- Calendar status shows connected
- Dashboard shows the connected state

### 6. AI summary flow

Test:

- Book an appointment as a patient
- Enter symptoms
- Confirm the booking
- Open the doctor appointment detail page
- Verify the pre-visit AI summary is generated
- Add notes and complete the appointment
- Verify the post-visit summary is saved

Expected:

- The backend generates AI summaries
- The UI does not show fallback text unless the AI service fails
- Appointment records store the generated summaries

### 7. Role boundaries

Test:

- Try opening doctor pages as a patient
- Try opening admin pages as a doctor
- Try opening patient pages as an unauthenticated user

Expected:

- Access is denied where appropriate
- Unauthorized users are redirected or blocked
- No private data is exposed across roles


## Data checks reviewers should make

Please verify:

- Appointment status changes correctly across hold, confirm, complete, and cancel
- Calendar connection state persists after refresh
- AI summaries are stored and displayed correctly
- Doctor leave days affect slot generation
- Admin edits are reflected in the doctor portal and patient booking flow

## Suggested browser setup

Use:

- one normal browser window for one role
- one incognito/private window for another role

This avoids localStorage token conflicts between roles.

## Final review checklist

Before approving the app, confirm:

- all three portals load
- booking works end-to-end
- doctor completion works end-to-end
- admin doctor management works
- calendar OAuth works
- AI summaries work
- no route breaks are observed
- no console errors block normal usage

