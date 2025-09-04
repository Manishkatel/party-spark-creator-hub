from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import os

def user_profile_pic_path(instance, filename):
    return f'profile_pics/{instance.id}/{filename}'

def club_logo_path(instance, filename):
    return f'club_logos/{instance.id}/{filename}'

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('regular', 'Regular User'),
        ('club', 'Club User'),
    ]
    
    YEAR_CHOICES = [
        ('freshman', 'Freshman'),
        ('sophomore', 'Sophomore'),
        ('junior', 'Junior'),
        ('senior', 'Senior'),
        ('graduate', 'Graduate'),
        ('alumni', 'Alumni'),
        ('other', 'Other'),
    ]
    
    INTEREST_CHOICES = [
        ('academic', 'Academic'),
        ('sports', 'Sports'),
        ('workshops', 'Workshops'),
        ('technology', 'Technology'),
        ('arts_culture', 'Arts & Culture'),
        ('photography', 'Photography'),
        ('science', 'Science'),
        ('leadership', 'Leadership'),
        ('networking', 'Networking'),
        ('social_events', 'Social Events'),
        ('music', 'Music'),
        ('business', 'Business'),
        ('community_service', 'Community Service'),
        ('career_development', 'Career Development'),
        ('research', 'Research'),
        ('all_types', 'All Types'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='regular')
    profile_pic = models.ImageField(upload_to=user_profile_pic_path, blank=True, null=True)
    year_in_college = models.CharField(max_length=20, choices=YEAR_CHOICES, blank=True)
    interests = models.JSONField(default=list, blank=True)  # Store multiple interests
    
    # Fix for the groups and user_permissions clash
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class Club(models.Model):
    CLUB_TYPE_CHOICES = [
        ('academic', 'Academic'),
        ('professional', 'Professional'),
        ('sports', 'Sports'),
        ('cultural', 'Cultural'),
        ('technical', 'Technical'),
        ('social', 'Social'),
        ('other', 'Other'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_clubs')
    club_logo = models.ImageField(upload_to=club_logo_path, blank=True, null=True)
    club_name = models.CharField(max_length=100)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    club_type = models.CharField(max_length=20, choices=CLUB_TYPE_CHOICES)
    custom_club_type = models.CharField(max_length=100, blank=True)  # For 'other' type
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    website_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.club_name


class Member(models.Model):
    YEAR_CHOICES = [
        ('freshman', 'Freshman'),
        ('sophomore', 'Sophomore'),
        ('junior', 'Junior'),
        ('senior', 'Senior'),
        ('graduate', 'Graduate'),
        ('alumni', 'Alumni'),
        ('other', 'Other'),
    ]
    
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='members')
    profile_pic = models.ImageField(upload_to='member_pics/', blank=True, null=True)
    member_name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    email = models.EmailField()
    year_in_college = models.CharField(max_length=20, choices=YEAR_CHOICES)
    joined_date = models.DateField()
    
    class Meta:
        unique_together = ['club', 'email']
    
    def __str__(self):
        return f"{self.member_name} - {self.club.club_name}"


class Achievement(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    date_achieved = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.club.club_name}"


class Event(models.Model):
    EVENT_TYPE_CHOICES = [
        ('academic', 'Academic'),
        ('professional', 'Professional'),
        ('sports', 'Sports'),
        ('cultural', 'Cultural'),
        ('technical', 'Technical'),
        ('social', 'Social'),
        ('other', 'Other'),
    ]
    
    VIRTUAL_CHOICES = [
        ('real', 'Real'),
        ('virtual', 'Virtual'),
    ]
    
    affiliated_club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    custom_event_type = models.CharField(max_length=100, blank=True)  # For 'other' type
    event_title = models.CharField(max_length=200)
    short_description = models.CharField(max_length=200)
    detailed_description = models.TextField()
    event_date = models.DateField()
    event_time = models.TimeField()
    location = models.CharField(max_length=500)
    is_virtual = models.CharField(max_length=10, choices=VIRTUAL_CHOICES, default='real')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_attendees = models.IntegerField( 
        validators=[MinValueValidator(1), MaxValueValidator(1000)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Many-to-many relationships
    interested_users = models.ManyToManyField(User, blank=True, related_name='interested_events')
    joined_users = models.ManyToManyField(User, blank=True, related_name='joined_events')
    
    class Meta:
        ordering = ['event_date', 'event_time']
    
    def __str__(self):
        return f"{self.event_title} - {self.affiliated_club.club_name}"
    
    @property
    def is_free(self):
        return self.price == 0


class ClubMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='club_memberships')
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='user_memberships')
    joined_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'club']
    
    def __str__(self):
        return f"{self.user.username} - {self.club.club_name}"
    