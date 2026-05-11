/**
 * Admin UI only — dropdown options and default API query shapes.
 * Change here if backend filter values differ.
 */

export const PET_STATUS_FILTER_OPTIONS = ["", "Pending", "Approved", "Rejected"];

export const USER_ROLE_FILTER_OPTIONS = ["", "Admin", "Owner", "Adopter"];

export const USER_STATUS_FILTER_OPTIONS = ["", "Pending", "Approved", "Rejected"];

/** Default GET /admin/pets query (pets page + SignalR refresh). */
export const DEFAULT_PETS_QUERY = { status: "", page: 1, pageSize: 50 };

/** Dashboard loads more rows for stats / recent activity. */
export const DASHBOARD_PETS_QUERY = { status: "", page: 1, pageSize: 500 };
