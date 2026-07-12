# EcoSphere ESG Platform

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Google sign-in

The Continue with Google button uses Supabase Auth. Before using it, enable the
Google provider in **Supabase Dashboard → Authentication → Providers → Google**
and add the Client ID and Client Secret from your Google Cloud OAuth client.

In Google Cloud, add the Supabase callback URL shown by the provider setup. In
Supabase **Authentication → URL Configuration**, add your deployed app URL and
the local development URL (`http://localhost:3000`) to the redirect allow list.
New Google users are created as `Employee` profiles in the first available
department; an administrator can assign their correct role and department
afterward.
