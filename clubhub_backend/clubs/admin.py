from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django import forms
from django.core.exceptions import ValidationError
import json
from .models import User, Club, Event, Member, Achievement, ClubMembership


class InterestsField(forms.MultipleChoiceField):
    """Custom field to handle JSONField as MultipleChoiceField"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.choices = User.INTEREST_CHOICES
    
    def prepare_value(self, value):
        """Convert JSONField value to format expected by MultipleChoiceField"""
        if isinstance(value, list):
            return value
        elif isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, list) else []
            except (json.JSONDecodeError, TypeError):
                return []
        return []
    
    def to_python(self, value):
        """Convert form value to Python list"""
        if not value:
            return []
        elif isinstance(value, list):
            return value
        return []


class CustomUserAdminForm(forms.ModelForm):
    """Custom form for User admin with proper interests handling"""
    
    interests = InterestsField(
        choices=User.INTEREST_CHOICES,
        widget=forms.SelectMultiple(attrs={
            'size': '8',
            'style': 'width: 100%; height: 200px;'
        }),
        required=False,
        help_text="Hold Ctrl/Cmd to select multiple interests"
    )
    
    class Meta:
        model = User
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set initial value for interests field
        if self.instance and self.instance.pk and self.instance.interests:
            self.fields['interests'].initial = self.instance.interests
    
    def clean_interests(self):
        """Ensure interests is always a list"""
        interests = self.cleaned_data.get('interests', [])
        return interests if isinstance(interests, list) else []
    
    def save(self, commit=True):
        """Custom save to handle interests field properly"""
        instance = super().save(commit=False)
        
        # Ensure interests is saved as a list
        interests = self.cleaned_data.get('interests', [])
        instance.interests = interests
        
        if commit:
            instance.save()
            self.save_m2m()
        
        return instance


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserAdminForm
    list_display = ['username', 'email', 'first_name', 'last_name', 'user_type', 'get_interests_display', 'is_active', 'date_joined']
    list_filter = ['user_type', 'is_active', 'is_staff', 'year_in_college']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'profile_pic', 'year_in_college', 'interests'),
            'classes': ('wide',),
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'profile_pic', 'year_in_college', 'interests'),
            'classes': ('wide',),
        }),
    )
    
    def get_interests_display(self, obj):
        """Display interests in list view"""
        if obj.interests:
            # Get the display names for the interests
            interest_dict = dict(User.INTEREST_CHOICES)
            display_names = [interest_dict.get(interest, interest) for interest in obj.interests]
            return ', '.join(display_names[:3]) + ('...' if len(display_names) > 3 else '')
        return 'None'
    get_interests_display.short_description = 'Interests'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


class MemberInline(admin.TabularInline):
    model = Member
    extra = 0
    fields = ['member_name', 'position', 'email', 'year_in_college', 'joined_date']


class AchievementInline(admin.TabularInline):
    model = Achievement
    extra = 0
    fields = ['title', 'description', 'date_achieved']


class EventInline(admin.TabularInline):
    model = Event
    extra = 0
    fields = ['event_title', 'event_date', 'event_time', 'event_type']
    readonly_fields = ['event_title', 'event_date', 'event_time', 'event_type']
    
    def has_add_permission(self, request, obj):
        return False


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ['club_name', 'owner', 'club_type', 'members_count', 'events_count', 'created_at']
    list_filter = ['club_type', 'created_at']
    search_fields = ['club_name', 'description', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [MemberInline, AchievementInline, EventInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('owner', 'club_logo', 'club_name', 'short_description', 'description')
        }),
        ('Club Details', {
            'fields': ('club_type', 'custom_club_type')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'website_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def members_count(self, obj):
        return obj.members.count()
    members_count.short_description = 'Members'
    
    def events_count(self, obj):
        return obj.events.count()
    events_count.short_description = 'Events'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('owner').prefetch_related('members', 'events')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'event_title', 'affiliated_club', 'event_date', 'event_time', 
        'event_type', 'price', 'interested_count', 'joined_count'
    ]
    list_filter = ['event_type', 'is_virtual', 'event_date', 'affiliated_club__club_type']
    search_fields = ['event_title', 'short_description', 'affiliated_club__club_name']
    readonly_fields = ['created_at', 'updated_at', 'interested_count', 'joined_count']
    date_hierarchy = 'event_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('affiliated_club', 'event_title', 'short_description')
        }),
        ('Event Details', {
            'fields': ('event_type', 'custom_event_type', 'detailed_description')
        }),
        ('Date & Location', {
            'fields': ('event_date', 'event_time', 'location', 'is_virtual')
        }),
        ('Capacity & Pricing', {
            'fields': ('max_attendees', 'price')
        }),
        ('Statistics', {
            'fields': ('interested_count', 'joined_count'),
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def interested_count(self, obj):
        count = obj.interested_users.count()
        return format_html('<span style="color: #007cba;">{}</span>', count)
    interested_count.short_description = 'Interested'
    
    def joined_count(self, obj):
        count = obj.joined_users.count()
        return format_html('<span style="color: #28a745;">{}</span>', count)
    joined_count.short_description = 'Joined'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'affiliated_club', 'affiliated_club__owner'
        ).prefetch_related('interested_users', 'joined_users')


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['member_name', 'club', 'position', 'email', 'year_in_college', 'joined_date']
    list_filter = ['year_in_college', 'club__club_type', 'joined_date']
    search_fields = ['member_name', 'email', 'club__club_name']
    date_hierarchy = 'joined_date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('club')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'club', 'date_achieved']
    list_filter = ['club__club_type', 'date_achieved']
    search_fields = ['title', 'description', 'club__club_name']
    date_hierarchy = 'date_achieved'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('club')


@admin.register(ClubMembership)
class ClubMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'club', 'joined_date']
    list_filter = ['club__club_type', 'joined_date']
    search_fields = ['user__username', 'club__club_name']
    date_hierarchy = 'joined_date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'club')


# Customize admin site header and title
admin.site.site_header = "ClubHub Admin"
admin.site.site_title = "ClubHub Admin Portal"
admin.site.index_title = "Welcome to ClubHub Administration"
