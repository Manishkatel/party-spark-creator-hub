from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Club, Event, Member, Achievement, ClubMembership


class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password1', 'password2', 'user_type', 'profile_pic',
            'year_in_college', 'interests'
        ]
    
    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password1')
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class UserProfileSerializer(serializers.ModelSerializer):
    owned_clubs_count = serializers.SerializerMethodField()
    created_events_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'profile_pic', 'year_in_college', 'interests',
            'owned_clubs_count', 'created_events_count'
        ]
        read_only_fields = ['id', 'username', 'user_type']
    
    def get_owned_clubs_count(self, obj):
        if obj.user_type == 'club':
            return obj.owned_clubs.count()
        return 0
    
    def get_created_events_count(self, obj):
        if obj.user_type == 'club':
            return Event.objects.filter(affiliated_club__owner=obj).count()
        return 0


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'


class ClubSerializer(serializers.ModelSerializer):
    members = MemberSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)
    events_count = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Club
        fields = [
            'id', 'club_logo', 'club_name', 'short_description', 'description',
            'club_type', 'custom_club_type', 'contact_email', 'contact_phone',
            'website_url', 'created_at', 'updated_at', 'members', 'achievements',
            'events_count', 'members_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_events_count(self, obj):
        return obj.events.count()
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ClubListSerializer(serializers.ModelSerializer):
    events_count = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Club
        fields = [
            'id', 'club_logo', 'club_name', 'short_description',
            'club_type', 'custom_club_type', 'events_count', 'members_count',
            'created_at'
        ]
    
    def get_events_count(self, obj):
        return obj.events.count()
    
    def get_members_count(self, obj):
        return obj.members.count()


class EventSerializer(serializers.ModelSerializer):
    affiliated_club_name = serializers.CharField(source='affiliated_club.club_name', read_only=True)
    interested_users_count = serializers.SerializerMethodField()
    joined_users_count = serializers.SerializerMethodField()
    is_interested = serializers.SerializerMethodField()
    is_joined = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'affiliated_club', 'affiliated_club_name', 'event_type',
            'custom_event_type', 'event_title', 'short_description',
            'detailed_description', 'event_date', 'event_time', 'location',
            'is_virtual', 'price', 'max_attendees', 'created_at', 'updated_at',
            'interested_users_count', 'joined_users_count', 'is_interested',
            'is_joined', 'is_free'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_interested_users_count(self, obj):
        return obj.interested_users.count()
    
    def get_joined_users_count(self, obj):
        return obj.joined_users.count()
    
    def get_is_interested(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.interested_users.filter(id=request.user.id).exists()
        return False
    
    def get_is_joined(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.joined_users.filter(id=request.user.id).exists()
        return False


class EventListSerializer(serializers.ModelSerializer):
    affiliated_club_name = serializers.CharField(source='affiliated_club.club_name', read_only=True)
    interested_users_count = serializers.SerializerMethodField()
    is_interested = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'affiliated_club_name', 'event_type', 'event_title',
            'short_description', 'event_date', 'event_time', 'location',
            'is_virtual', 'price', 'interested_users_count', 'is_interested', 'is_free'
        ]
    
    def get_interested_users_count(self, obj):
        return obj.interested_users.count()
    
    def get_is_interested(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.interested_users.filter(id=request.user.id).exists()
        return False


class ClubMembershipSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.club_name', read_only=True)
    club_logo = serializers.ImageField(source='club.club_logo', read_only=True)
    
    class Meta:
        model = ClubMembership
        fields = ['id', 'club', 'club_name', 'club_logo', 'joined_date']
        read_only_fields = ['id', 'joined_date']

class DashboardSerializer(serializers.Serializer):
    user_type = serializers.CharField()
    total_clubs = serializers.IntegerField()
    total_events = serializers.IntegerField()
    interested_events_count = serializers.IntegerField()
    joined_events_count = serializers.IntegerField()
    joined_clubs_count = serializers.IntegerField()