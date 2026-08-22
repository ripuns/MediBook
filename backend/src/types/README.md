# Types

## Purpose
This folder holds shared type declarations for the backend. It is used for augmenting third-party types when the Express request object needs additional authenticated-user fields.

## Why a separate folder?
Type augmentation is configuration-like infrastructure, not app business logic. Keeping it separate prevents route and service files from carrying global type declarations and keeps express-specific typing in one clear location.

## Files in this folder
| File | What it does |
|------|--------------|
| express.d.ts | Adds the authenticated user shape to Express Request objects |

## How it connects to the rest of the system
The request augmentation is consumed by auth middleware and protected route handlers so they can rely on a `req.user` object with typed identity data.
