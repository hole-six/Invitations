# Master-Instance Pattern Implementation

## Overview
Implement the Master-Instance pattern for wedding invitation templates, similar to Canva/Wix. Users select a master template, which creates a new invitation instance they can edit independently.

## User Flow
1. User browses templates in CollectionPage
2. User clicks "Use Template" button
3. System creates new invitation (instance) by cloning template's design_data
4. User is redirected to EditorPage with the new invitation ID
5. User edits their invitation (changes don't affect master template)
6. User publishes invitation with custom slug
7. Public can view invitation at `/invitation/:slug`

## Database Architecture (Already Exists)
- **templates** table = Master templates (read-only, created by admin)
- **invitations** table = User instances (editable copies with template_id foreign key)
- **design_data** column = JSON containing all canvas elements and settings

## Requirements

### 1. Backend: Create Invitation from Template
**Endpoint**: `POST /api/invitations/from-template`

**Request Body**:
```json
{
  "template_id": 100,
  "title": "My Wedding Invitation"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "...",
    "user_id": 1,
    "template_id": 100,
    "title": "My Wedding Invitation",
    "slug": "my-wedding-invitation",
    "design_data": { /* cloned from template */ },
    "status": "draft",
    "created_at": "..."
  }
}
```

**Logic**:
- Fetch template by ID
- Clone template's design_data to new invitation
- Generate unique slug from title
- Set status to 'draft'
- Set template_id foreign key
- Return new invitation

**Files to Modify**:
- `backend/app/Controllers/InvitationController.php` - Add `createFromTemplate()` method
- `backend/app/Services/InvitationService.php` - Add `createFromTemplate()` method
- `backend/app/Repositories/InvitationRepository.php` - May need to fetch template
- `backend/routes/api.php` - Add route

### 2. Frontend: Update CollectionPage
**Changes**:
- Add "Use Template" button to each template card
- On click, call API to create invitation from template
- Show loading state during creation
- Redirect to EditorPage with new invitation ID
- Handle errors (not logged in, API failure)

**Files to Modify**:
- `frontend/src/pages/CollectionPage.jsx`
- `frontend/src/services/invitation.service.js` - Add `createFromTemplate()` method

### 3. Frontend: Update EditorPage
**Changes**:
- Check URL params for `invitationId` instead of `templateId`
- Load invitation data (not template data) when editing
- Save changes to invitation (not template)
- Update page title to show "Editing: {invitation.title}"

**Current Behavior** (needs change):
- EditorPage loads template from sessionStorage
- Changes are not saved to database

**New Behavior**:
- EditorPage loads invitation by ID from API
- Auto-save changes to invitation every 30 seconds
- Manual save button
- Show save status indicator

**Files to Modify**:
- `frontend/src/pages/EditorPage.jsx`

### 4. Frontend: Create Public Viewer Page
**Route**: `/invitation/:slug`

**Features**:
- Fetch invitation by slug from public API
- Render invitation from design_data JSON
- No editing capabilities
- Show RSVP form if enabled
- Show comments if enabled
- Track page view analytics

**Files to Create**:
- `frontend/src/pages/InvitationViewPage.jsx`
- Update `frontend/src/App.js` to add route

### 5. Frontend: Implement Publish Flow
**Changes to EditorPage**:
- Add "Publish" button in header
- Show publish modal with:
  - Custom slug input (editable)
  - Visibility options (public/private/password)
  - Password field (if password-protected)
  - Preview URL
- Call publish API endpoint
- Show success message with public URL

**Files to Modify**:
- `frontend/src/pages/EditorPage.jsx`
- `frontend/src/components/editor/PublishModal.jsx` (create new)

## Acceptance Criteria

### Backend
- [ ] POST /api/invitations/from-template endpoint works
- [ ] Template design_data is cloned correctly to invitation
- [ ] Unique slug is generated for each invitation
- [ ] template_id foreign key is set correctly
- [ ] User can only access their own invitations
- [ ] Public API returns published invitations by slug

### Frontend - CollectionPage
- [ ] "Use Template" button appears on each template
- [ ] Button shows loading state when clicked
- [ ] User is redirected to EditorPage after creation
- [ ] Error message shown if not logged in
- [ ] Error message shown if API fails

### Frontend - EditorPage
- [ ] Loads invitation data by ID from URL params
- [ ] Shows invitation title in page header
- [ ] Auto-saves changes every 30 seconds
- [ ] Manual save button works
- [ ] Save status indicator shows "Saved" / "Saving..." / "Error"
- [ ] Publish button opens publish modal
- [ ] Publish modal allows custom slug and visibility settings
- [ ] Published invitation shows public URL

### Frontend - InvitationViewPage
- [ ] Renders invitation from slug
- [ ] Shows 404 if invitation not found
- [ ] Shows password prompt if password-protected
- [ ] Renders all elements from design_data correctly
- [ ] Tracks page view analytics
- [ ] Shows RSVP form if enabled

## Technical Notes

### Design Data Structure
```json
{
  "canvas": {
    "width": 450,
    "height": 2520,
    "background": "#ffffff",
    "pages": 4
  },
  "elements": [
    {
      "id": "text-1",
      "type": "text",
      "content": "Jonathan & Juliana",
      "x": 25,
      "y": 200,
      "width": 400,
      "height": 90,
      "fontSize": 52,
      "fontFamily": "Great Vibes",
      "color": "#8B6F47"
    }
  ]
}
```

### URL Structure
- Template selection: `/collection`
- Editing invitation: `/editor?invitationId=123`
- Public view: `/invitation/my-wedding-slug`

### Security
- Only authenticated users can create invitations
- Users can only edit their own invitations
- Public API only returns published invitations
- Password-protected invitations require password

## Implementation Order
1. Backend: Create endpoint and service method
2. Frontend: Update invitation service
3. Frontend: Update CollectionPage with "Use Template" button
4. Frontend: Update EditorPage to load invitation by ID
5. Frontend: Implement auto-save functionality
6. Frontend: Create publish modal
7. Frontend: Create public viewer page
8. Testing: End-to-end flow

## Out of Scope (Future)
- Version history (table exists but not implemented)
- Collaborative editing
- Template marketplace
- Advanced analytics dashboard
