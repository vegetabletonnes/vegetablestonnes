# VegetableTonnes --- Phase 2 Implementation Plan

Version: 2.0

## Objective

Transition the existing React + Express implementation into a
production-ready B2B agricultural bidding platform aligned with the
latest UI system, branding, and bid workflow.

------------------------------------------------------------------------

# 1. Design System

## Color Palette

  Token       Hex
  ----------- -----------
  Primary     `#0D1B1E`
  Secondary   `#14B8A6`
  Tertiary    `#E8F7F1`
  Neutral     `#64748B`

## Typography

-   Headings: **Montserrat**
-   Body: **Inter**
-   Labels: **Inter**

------------------------------------------------------------------------

# 2. Updated Navigation

Public

-   Home
-   Products
-   Auctions
-   How It Works
-   About
-   Login
-   Register

Buyer

-   Dashboard
-   My Bids
-   Orders
-   Payments
-   Invoices
-   Notifications
-   Profile

Admin

-   Dashboard
-   Inventory
-   Auctions
-   Bid Review
-   Orders
-   Buyers
-   Sellers
-   Reports
-   Settings

------------------------------------------------------------------------

# 3. Updated Bid Workflow

## Step 1 --- Inventory Discovery

Buyer sees:

-   Commodity
-   Grade
-   Images
-   Base Price / Ton
-   Available Quantity
-   Origin
-   Warehouse
-   Auction Status

CTA

Add to Bid

------------------------------------------------------------------------

## Step 2 --- Wholesale Bid Submission

Buyer enters

-   Quantity
-   Offer Price / Ton
-   Delivery Destination / Mandi
-   Delivery Date
-   Remarks

Validation

-   Quantity ≤ Available Stock
-   Price \> 0
-   Destination mandatory

------------------------------------------------------------------------

## Step 3 --- Order Pending

System generates

-   Order ID
-   Timestamp
-   Bid Summary

Status

Order Pending

------------------------------------------------------------------------

## Step 4 --- Admin Review

Admin can

-   Accept
-   Reject
-   Counter Offer
-   Request Clarification

------------------------------------------------------------------------

## Step 5 --- Payment

Methods

-   UPI
-   Credit Card
-   Debit Card
-   Net Banking
-   NEFT / RTGS

------------------------------------------------------------------------

## Step 6 --- Confirmation

Generate

-   GST Invoice
-   Order Confirmation
-   Dispatch Preparation
-   Email + SMS Notifications

------------------------------------------------------------------------

# 4. Buyer Dashboard

Cards

-   Active Bids
-   Pending Orders
-   Accepted Orders
-   Completed Orders
-   Total Spend

Tables

-   Recent Orders
-   Bid History
-   Payment History
-   Invoice Downloads

------------------------------------------------------------------------

# 5. Admin Dashboard

Modules

-   Inventory Management
-   Product CRUD
-   Auction Management
-   Bid Approval
-   Buyer Verification
-   Seller Verification
-   Logistics
-   Payments
-   Reports

------------------------------------------------------------------------

# 6. Inventory Module

Each commodity contains

-   Images
-   SKU
-   Commodity
-   Variety
-   Grade
-   Quantity
-   Base Price
-   Available Tons
-   Warehouse
-   Status

------------------------------------------------------------------------

# 7. Auction Engine

Features

-   Countdown Timer
-   Live Bid Feed
-   Auto Refresh
-   Minimum Increment
-   Auto Close
-   Winner Selection

------------------------------------------------------------------------

# 8. Order Status Lifecycle

Draft

↓

Pending

↓

Accepted / Rejected / Counter Offered

↓

Payment Pending

↓

Payment Successful

↓

Confirmed

↓

Preparing Dispatch

↓

Dispatched

↓

Delivered

↓

Completed

------------------------------------------------------------------------

# 9. Notifications

Trigger

-   Bid Submitted
-   Bid Accepted
-   Bid Rejected
-   Counter Offer
-   Payment Received
-   Invoice Generated
-   Dispatch Started
-   Delivered

Channels

-   Email
-   SMS
-   In-App

------------------------------------------------------------------------

# 10. Backend Enhancements

Add

-   WebSocket events
-   Notification service
-   Invoice service
-   Payment gateway abstraction
-   Audit logging
-   File upload
-   Role-based authorization

------------------------------------------------------------------------

# 11. Database Enhancements

Collections

-   users
-   buyers
-   sellers
-   products
-   inventory
-   auctions
-   bids
-   orders
-   invoices
-   payments
-   notifications
-   warehouses
-   logistics

------------------------------------------------------------------------

# 12. UI Components

Reusable

-   Product Card
-   Auction Card
-   Bid Drawer
-   Status Badge
-   Countdown
-   Metric Card
-   Order Timeline
-   Invoice Viewer
-   Confirmation Modal

------------------------------------------------------------------------

# 13. Development Milestones

## Sprint 1

-   Apply new design system
-   Responsive layout
-   Authentication polish

## Sprint 2

-   Inventory
-   Product pages
-   Auction pages

## Sprint 3

-   Bid workflow
-   Order tracker
-   Buyer dashboard

## Sprint 4

-   Admin panel
-   Bid review
-   Reports

## Sprint 5

-   Payments
-   Invoice generation
-   Notifications

## Sprint 6

-   QA
-   Performance
-   Security
-   Deployment

