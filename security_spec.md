# Firestore Security Specification — KD Makeovers & Cosmetics

## Data Invariants
1. **Appointments**: Created only with `status == 'pending'`, server `createdAt == request.time`, zero pre-awarded `pointsEarned`/`pointsUsed`, and `advancePaid == 0`. PII (`name`, `phone`, `email`) is readable ONLY by the owning signed-in user or verified admin.
2. **Booked Slots (Double-Booking Prevention)**: `bookedSlots/{slotKey}` holds only non-PII schedule metadata (`date`, `time`, `appointmentId`, `status`, `createdAt`) and cannot be overwritten on `create` if the slot already exists.
3. **Booking Trackers (Guest Lookup)**: `bookingTrackers/{trackingHash}` allows single-doc `get` by `sha256(bookingCode + phone)` with `allow list: if false;` so guests can check status without exposing any collection list or PII.
4. **User Profiles**: Strictly readable by owner or admin (`allow list` restricted to `isAdmin()` or `resource.data.uid == request.auth.uid`). Customers cannot modify `loyaltyPoints`, `totalSpent`, `totalVisits`, or inject `role`/`isAdmin`.
5. **Catalogues & Settings**: `services`, `serviceCategories`, `packages`, `gallery`, `offers`, `businessSettings` are publicly readable and strictly admin-writable.
6. **Reviews**: Creatable with `approved == false` and server `createdAt == request.time`; publicly readable only when `approved == true`.
7. **Payments & Activity Logs**: Strictly admin-writable; `payments` readable by admin or owning customer (`resource.data.userId == request.auth.uid`); `activityLogs` strictly admin-only.
8. **Notifications**: Admin notifications readable/updatable only by admin; customer notifications readable/updatable only by `recipientUid == request.auth.uid`.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Create an appointment with `userId: "victim-uid"` while unauthenticated or signed in as another user.
2. **Privilege Escalation**: Update `loyaltyPoints: 99999` or `totalSpent: 50000` on `/userProfiles/{uid}`.
3. **Shadow Field Injection**: Create a user profile with an unexpected `isAdmin: true` or `role: "admin"` field.
4. **State Shortcutting**: Create an appointment directly with `status: "confirmed"` or `status: "completed"`.
5. **Double Booking Collision**: Attempt to create a `bookedSlots/{slotKey}` document when that `slotKey` already exists.
6. **Admin Lockdown**: Attempt to write to `services`, `packages`, `offers`, `businessSettings`, or `activityLogs` as a customer.
7. **Bypass Review Approval**: Attempt to query or read unapproved reviews (`approved == false`) as a non-admin.
8. **PII Collection Scrape**: Attempt `list` on `/appointments`, `/userProfiles`, `/bookingTrackers`, or `/payments` as an unauthenticated or non-owner user.
9. **Resource Poisoning**: Inject a >1000 char `name` or >128 char document ID (`../poison`).
10. **Timestamp Spoofing**: Submit `createdAt` or `updatedAt` different from `request.time`.
11. **Email Spoofing**: Authenticate with unverified email matching admin email (`email_verified == false`).
12. **Payment Tampering**: Customer attempts to create or update a `/payments/{paymentId}` document to mark an unpaid booking as `paid`.
