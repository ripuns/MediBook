# Config

## Purpose
This folder centralises runtime configuration for the backend service. It validates environment variables at startup so that services are only allowed to run when required secrets, ports, and URLs are present and correctly shaped.

## Why a separate folder?
Configuration should not be embedded in route handlers or utilities because it affects every part of the application. Isolating it here keeps startup behavior consistent and makes environment contract changes reviewable in one place instead of scattered throughout the codebase.

## Files in this folder
| File | What it does |
|------|--------------|
| env.ts | Loads and validates environment variables with Zod before the app starts |

## How it connects to the rest of the system
The validated config object is consumed by the backend bootstrap and service modules that need database credentials, JWT secrets, third-party API configuration, and frontend redirect settings.
