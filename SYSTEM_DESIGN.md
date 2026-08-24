# System Design

## Double-booking prevention

MediBook prevents double booking with layered defenses because a single guard is not enough under concurrent traffic. The first layer lives in the booking service. When a patient requests a hold, the service runs the conflict check and the insert in the same Prisma transaction. That keeps the read and write atomic, so two requests cannot both decide the slot is free before either one writes the row. The conflict query ignores expired holds and treats only confirmed appointments and active holds as blocking.

The second layer is the database unique constraint on `doctorId` and `slotStart`. This is the final safety net when two requests race so closely that application logic is not enough. If Prisma raises `P2002`, the global error handler converts it into HTTP 409. The frontend can then show the slot as unavailable without guessing why the booking failed.

The third layer is the cleanup job that removes stale held appointments every minute. Holds exist only to give a patient a short window to finish the symptom form. If they abandon the flow, the cron job deletes the expired rows and releases the slot for the next patient. This keeps the database current and prevents ghost reservations from accumulating.

## Doctor leave handling

Doctor leave is treated as an operational event, not just a calendar note. When an admin creates a leave day, the service inserts the leave row first so the system has a durable record of the absence. Then it finds confirmed appointments for that doctor on that date and cancels them in bulk. That order matters because if anything fails during the transaction, the leave record and the appointment changes roll back together.

After the database update, notification work is queued separately. Cancellation emails and calendar deletions are fire-and-forget so the admin does not wait on third-party services. That choice keeps the leave action responsive even when email or Google APIs are slow. The UI can then display how many patients were affected and move on.

## Slot hold mechanism

The hold flow gives patients a short exclusive window to finish booking. A slot starts as available, then becomes `HELD` for five minutes when the patient picks it. While the hold is active, the slot is hidden from other users. If the patient confirms in time, the appointment becomes `CONFIRMED` and the hold expires field is cleared. If they do nothing, the cleanup job removes the row and the slot returns to the pool.

This pattern is a good fit for healthcare scheduling because it balances fairness and throughput. Patients are not forced to complete a full form before securing a time, but the clinic also does not lose availability to abandoned carts. The frontend shows the hold state explicitly so users understand they are in a timed flow.

## Notification failure handling and retry

All outbound notifications pass through a queue table so delivery attempts are observable and retryable. Each email or calendar action creates a `NotificationLog` row with `PENDING`, then the worker or caller processes it and updates the row to `SENT`, `FAILED`, or `GAVE_UP`. The notification service tracks attempts and stores enough payload data to retry without rebuilding the message from scratch.

Retries use backoff so repeated failures do not hammer the same provider. The retry job wakes every five minutes and only picks up rows whose waiting period has elapsed. After three failed attempts, the status moves to `GAVE_UP`. That gives the admin dashboard a reliable signal that something needs manual attention.

This design makes the system resilient in the places where external services are weakest. Bookings still succeed if LLM generation fails, calendar sync can be skipped when OAuth is missing, and notification delivery can recover later without blocking the core appointment flow. The result is a system that stays useful even when pieces around it misbehave.

## Responsibility boundaries

The frontend owns interaction design, navigation, and optimistic user feedback. It should never contain business rules such as slot conflicts, leave collision handling, or retry timing. Those decisions belong on the backend so every client sees the same truth. The backend owns validation, persistence, integration calls, and state transitions. The database enforces invariants that the application may accidentally miss.

This separation keeps the product easier to reason about. A patient can retry a booking from a different browser and still hit the same rules. An admin can refresh the dashboard and see the same leave and notification status that the workers are operating on. The system behaves consistently because the source of truth is centralized instead of spread across pages.

This also leaves room for future scaling. The same API can serve web, mobile, and internal tools without duplicating rules. Jobs can be scaled independently when reminder traffic grows.

That keeps operations tidy.
