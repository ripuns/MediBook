# Routes

## Purpose
This folder contains the HTTP route definitions for the MediBook API. It maps URL paths to controller functions and keeps the routing layer focused on endpoint registration.

## Why a separate folder?
Routes define the external contract of the application and should be separate from business logic. Keeping them organised here allows the app to grow without merging route registration into controllers or server bootstrap files.

## Files in this folder
| File | What it does |
|------|--------------|
| auth.routes.ts | Exposes the public authentication endpoints for register, login, refresh, logout, and me |

## How it connects to the rest of the system
The route files are mounted by the Express app bootstrap, and each route forwards requests to the corresponding controller and service logic. This creates a clean flow from HTTP request to domain action and response.
