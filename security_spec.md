# Firestore Security Specification

## Data Invariants
1. **Appointments**: Must have a valid name, phone, and date. Status can only be 'pending' with creation.
2. **User Profiles**: Only the owner can read/write their own profile. Loyalty points are immutable by users.
3. **Reviews**: Anyone can create a review, but only admins can approve or modify them. Public can only read approved reviews.
4. **Public Resources**: Services, Gallery, and Offers are publicly readable but only admin-writable.

## The "Dirty Dozen" Payloads (Identity & Integrity Attack Surface)
1. **Identity Spoofing**: Attempt to create an appointment with a different `userId`.
2. **Privilege Escalation**: Attempt to update `loyaltyPoints` in `userProfiles`.
3. **Shadow Field Injection**: Attempt to add `isAdmin: true` to a `userProfile`.
4. **State Shortcutting**: Attempt to create an appointment with `status: 'completed'`.
5. **Admin Lockdown**: Attempt to delete a service as a non-admin.
6. **Bypass Approval**: Attempt to read unapproved reviews as a guest.
7. **Resource Poisoning**: Attempt to use a 1MB string as a `name` in `userProfiles`.
8. **ID Poisoning**: Attempt to use `../poison/path` as a document ID.
9. **Timestamp Spoofing**: Attempt to provide a past `createdAt` date instead of `request.time`.
10. **Cross-Tenant Leak**: Attempt to read another user's `userProfile`.
11. **Shadow Update**: Attempt to update `email` in a `userProfile` (should be immutable).
12. **Orphaned Writes**: Attempt to create an appointment without a valid service reference.

## Test Runner (TDD)
(Tests would be implemented in `firestore.rules.test.ts` following these scenarios)
