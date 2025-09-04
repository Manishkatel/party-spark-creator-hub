from django.urls import path, include
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.logout_view, name='user-logout'),
    
    # User Profile URLs
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    
    # Club URLs
    path('clubs/', views.ClubListCreateView.as_view(), name='club-list-create'),
    path('clubs/<int:pk>/', views.ClubDetailView.as_view(), name='club-detail'),
    path('clubs/my/', views.MyClubsView.as_view(), name='my-clubs'),
    path('clubs/<int:club_id>/join/', views.join_club, name='join-club'),
    path('clubs/<int:club_id>/leave/', views.leave_club, name='leave-club'),
    
    # Event URLs
    path('events/', views.EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('events/my/', views.MyEventsView.as_view(), name='my-events'),
    path('events/<int:event_id>/interest/', views.toggle_event_interest, name='toggle-event-interest'),
    path('events/<int:event_id>/join/', views.join_event, name='join-event'),
    path('events/<int:event_id>/leave/', views.leave_event, name='leave-event'),
    
    # Member URLs (nested under clubs)
    path('clubs/<int:club_id>/members/', views.MemberListCreateView.as_view(), name='member-list-create'),
    path('clubs/<int:club_id>/members/<int:pk>/', views.MemberDetailView.as_view(), name='member-detail'),
    
    # Achievement URLs (nested under clubs)
    path('clubs/<int:club_id>/achievements/', views.AchievementListCreateView.as_view(), name='achievement-list-create'),
    path('clubs/<int:club_id>/achievements/<int:pk>/', views.AchievementDetailView.as_view(), name='achievement-detail'),
    
    # User's activity URLs
    path('user/interested-events/', views.user_interested_events, name='user-interested-events'),
    path('user/joined-events/', views.user_joined_events, name='user-joined-events'),
    path('user/joined-clubs/', views.user_joined_clubs, name='user-joined-clubs'),
    
    # Search URL
    path('search/', views.search_view, name='search'),
]

