<?php

use App\Controllers\AuthController;
use App\Controllers\InvitationController;
use App\Controllers\TemplateController;
use App\Controllers\GuestController;
use App\Controllers\RsvpController;
use App\Controllers\MediaController;
use App\Controllers\AnalyticsController;
use App\Controllers\SubscriptionController;
use App\Controllers\AdminController;

// Get router from global
$router = $GLOBALS['router'];

// Health check
$router->get('/api/health', function() {
    \App\Core\Response::success(['status' => 'ok', 'timestamp' => time()]);
});

// ============================================
// AUTH ROUTES
// ============================================
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->post('/api/auth/refresh', [AuthController::class, 'refresh']);
$router->get('/api/auth/me', [AuthController::class, 'me']);
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);

// ============================================
// INVITATION ROUTES
// ============================================
$router->get('/api/invitations', [InvitationController::class, 'index']);
$router->get('/api/invitations/users', [InvitationController::class, 'getAllUsers']); // Admin get all users
$router->post('/api/invitations', [InvitationController::class, 'store']);
$router->post('/api/invitations/from-template', [InvitationController::class, 'createFromTemplate']);
$router->get('/api/invitations/{id}', [InvitationController::class, 'show']);
$router->put('/api/invitations/{id}', [InvitationController::class, 'update']);
$router->delete('/api/invitations/{id}', [InvitationController::class, 'destroy']);
$router->post('/api/invitations/{id}/publish', [InvitationController::class, 'publish']);
$router->post('/api/invitations/{id}/duplicate', [InvitationController::class, 'duplicate']);
$router->get('/api/invitations/{id}/versions', [InvitationController::class, 'versions']);
$router->post('/api/invitations/{id}/restore', [InvitationController::class, 'restore']);

// Public invitation view (support both GET and POST for password)
$router->get('/api/public/invitations/{slug}', [InvitationController::class, 'publicView']);
$router->post('/api/public/invitations/{slug}', [InvitationController::class, 'publicView']);

// ============================================
// TEMPLATE ROUTES
// ============================================
$router->get('/api/templates', [TemplateController::class, 'index']);
$router->get('/api/templates/categories', [TemplateController::class, 'categories']);
$router->get('/api/templates/{id}', [TemplateController::class, 'show']);
$router->post('/api/templates', [TemplateController::class, 'store']);
$router->put('/api/templates/{id}', [TemplateController::class, 'update']);
$router->delete('/api/templates/{id}', [TemplateController::class, 'destroy']);

// ============================================
// GUEST & RSVP ROUTES
// ============================================
$router->get('/api/invitations/{id}/guests', [GuestController::class, 'index']);
$router->post('/api/invitations/{id}/guests', [GuestController::class, 'store']);
$router->put('/api/guests/{id}', [GuestController::class, 'update']);
$router->delete('/api/guests/{id}', [GuestController::class, 'destroy']);
$router->post('/api/guests/import', [GuestController::class, 'import']);
$router->get('/api/guests/export', [GuestController::class, 'export']);

$router->post('/api/invitations/{id}/rsvp', [RsvpController::class, 'submit']);
$router->get('/api/invitations/{id}/rsvp', [RsvpController::class, 'list']);

// ============================================
// MEDIA ROUTES
// ============================================
$router->get('/api/media', [MediaController::class, 'index']);
$router->post('/api/media/upload', [MediaController::class, 'upload']);
$router->delete('/api/media/{id}', [MediaController::class, 'destroy']);

// ============================================
// ANALYTICS ROUTES
// ============================================
$router->get('/api/invitations/{id}/analytics', [AnalyticsController::class, 'show']);
$router->post('/api/invitations/{id}/track', [AnalyticsController::class, 'track']);

// ============================================
// SUBSCRIPTION ROUTES
// ============================================
$router->get('/api/subscriptions/plans', [SubscriptionController::class, 'plans']);
$router->post('/api/subscriptions/subscribe', [SubscriptionController::class, 'subscribe']);
$router->get('/api/subscriptions/current', [SubscriptionController::class, 'current']);
$router->post('/api/subscriptions/cancel', [SubscriptionController::class, 'cancel']);

// ============================================
// ADMIN ROUTES
// ============================================
$router->get('/api/admin/dashboard/stats', [AdminController::class, 'dashboardStats']);

// Admin User Management
$router->get('/api/admin/users', [AdminController::class, 'getUsers']);
$router->post('/api/admin/users', [AdminController::class, 'createUser']);
$router->put('/api/admin/users/{id}', [AdminController::class, 'updateUser']);
$router->delete('/api/admin/users/{id}', [AdminController::class, 'deleteUser']);

// Admin Invitation Management
$router->get('/api/admin/invitations', [AdminController::class, 'getAllInvitations']);
$router->put('/api/admin/invitations/{id}/status', [AdminController::class, 'updateInvitationStatus']);
$router->delete('/api/admin/invitations/{id}', [AdminController::class, 'deleteInvitation']);

// Admin Template Management
$router->get('/api/admin/templates', [AdminController::class, 'getAllTemplates']);
$router->put('/api/admin/templates/{id}/status', [AdminController::class, 'updateTemplateStatus']);
