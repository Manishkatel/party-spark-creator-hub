from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, date 
from .models import User, Club, Event, Member, Achievement, ClubMembership
from .serializers import ( 
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    ClubSerializer, ClubListSerializer, EventSerializer, EventListSerializer,
    MemberSerializer, AchievementSerializer, ClubMembershipSerializer,
    DashboardSerializer
) 
from .filters import EventFilter, ClubFilter


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': token.key
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except:
        pass
    logout(request)
    return Response({'message': 'Logged out successfully'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ClubListCreateView(generics.ListCreateAPIView):
    queryset = Club.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ClubFilter
    search_fields = ['club_name', 'description', 'short_description']
    ordering_fields = ['created_at', 'club_name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ClubListSerializer
        return ClubSerializer
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'club':
            return Response(
                {'error': 'Only club users can create clubs'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class ClubDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        obj = super().get_object()
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.owner != self.request.user:
                raise PermissionError('You can only modify your own clubs')
        return obj


class MyClubsView(generics.ListAPIView):
    serializer_class = ClubListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Club.objects.filter(owner=self.request.user)


class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EventFilter
    search_fields = ['event_title', 'detailed_description', 'short_description']
    ordering_fields = ['event_date', 'event_time', 'created_at']
    ordering = ['event_date', 'event_time']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventListSerializer
        return EventSerializer
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'club':
            return Response(
                {'error': 'Only club users can create events'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate that the affiliated club belongs to the user
        club_id = request.data.get('affiliated_club')
        try:
            club = Club.objects.get(id=club_id, owner=request.user)
        except Club.DoesNotExist:
            return Response(
                {'error': 'You can only create events for your own clubs'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        obj = super().get_object()
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.affiliated_club.owner != self.request.user:
                raise PermissionError('You can only modify events from your own clubs')
        return obj


class MyEventsView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Event.objects.filter(affiliated_club__owner=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_event_interest(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        user = request.user
        
        if user in event.interested_users.all():
            event.interested_users.remove(user)
            interested = False
        else:
            event.interested_users.add(user)
            interested = True
        
        return Response({
            'interested': interested,
            'interested_count': event.interested_users.count()
        })
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        user = request.user
        
        if user in event.joined_users.all():
            return Response(
                {'error': 'You have already joined this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if event.joined_users.count() >= event.max_attendees:
            return Response(
                {'error': 'Event is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event.joined_users.add(user)
        
        return Response({
            'message': 'Successfully joined the event',
            'joined_count': event.joined_users.count()
        })
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        user = request.user
        
        if user not in event.joined_users.all():
            return Response(
                {'error': 'You have not joined this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event.joined_users.remove(user)
        
        return Response({
            'message': 'Successfully left the event',
            'joined_count': event.joined_users.count()
        })
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_club(request, club_id):
    try:
        club = Club.objects.get(id=club_id)
        user = request.user
        
        if user.user_type != 'regular':
            return Response(
                {'error': 'Only regular users can join clubs'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership, created = ClubMembership.objects.get_or_create(
            user=user,
            club=club
        )
        
        if not created:
            return Response(
                {'error': 'You are already a member of this club'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'message': 'Successfully joined the club'})
    except Club.DoesNotExist:
        return Response(
            {'error': 'Club not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_club(request, club_id):
    try:
        membership = ClubMembership.objects.get(
            user=request.user,
            club_id=club_id
        )
        membership.delete()
        return Response({'message': 'Successfully left the club'})
    except ClubMembership.DoesNotExist:
        return Response(
            {'error': 'You are not a member of this club'},
            status=status.HTTP_400_BAD_REQUEST
        )


class MemberListCreateView(generics.ListCreateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        club_id = self.kwargs.get('club_id')
        return Member.objects.filter(club_id=club_id)
    
    def create(self, request, *args, **kwargs):
        club_id = self.kwargs.get('club_id')
        try:
            club = Club.objects.get(id=club_id, owner=request.user)
            request.data['club'] = club.id
        except Club.DoesNotExist:
            return Response(
                {'error': 'You can only add members to your own clubs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)


class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        club_id = self.kwargs.get('club_id')
        return Member.objects.filter(club_id=club_id)
    
    def get_object(self):
        obj = super().get_object()
        if obj.club.owner != self.request.user:
            raise PermissionError('You can only modify members of your own clubs')
        return obj


class AchievementListCreateView(generics.ListCreateAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        club_id = self.kwargs.get('club_id')
        return Achievement.objects.filter(club_id=club_id)
    
    def create(self, request, *args, **kwargs):
        club_id = self.kwargs.get('club_id')
        try:
            club = Club.objects.get(id=club_id, owner=request.user)
            request.data['club'] = club.id
        except Club.DoesNotExist:
            return Response(
                {'error': 'You can only add achievements to your own clubs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)


class AchievementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        club_id = self.kwargs.get('club_id')
        return Achievement.objects.filter(club_id=club_id)
    
    def get_object(self):
        obj = super().get_object()
        if obj.club.owner != self.request.user:
            raise PermissionError('You can only modify achievements of your own clubs')
        return obj


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    
    data = {
        'user_type': user.user_type,
        'total_clubs': 0,
        'total_events': 0,
        'interested_events_count': user.interested_events.count(),
        'joined_events_count': user.joined_events.count(),
        'joined_clubs_count': user.club_memberships.count()
    }
    
    if user.user_type == 'club':
        data['total_clubs'] = user.owned_clubs.count()
        data['total_events'] = Event.objects.filter(affiliated_club__owner=user).count()
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_interested_events(request):
    events = request.user.interested_events.all()
    serializer = EventListSerializer(events, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_joined_events(request):
    events = request.user.joined_events.all()
    serializer = EventListSerializer(events, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_joined_clubs(request):
    memberships = request.user.club_memberships.all()
    serializer = ClubMembershipSerializer(memberships, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_view(request):
    query = request.GET.get('q', '')
    search_type = request.GET.get('type', 'all')  # 'events', 'clubs', or 'all'
    
    results = {}
    
    if search_type in ['events', 'all'] and query:
        events = Event.objects.filter(
            Q(event_title__icontains=query) |
            Q(short_description__icontains=query) |
            Q(detailed_description__icontains=query)
        )
        results['events'] = EventListSerializer(
            events, many=True, context={'request': request}
        ).data
    
    if search_type in ['clubs', 'all'] and query:
        clubs = Club.objects.filter(
            Q(club_name__icontains=query) |
            Q(short_description__icontains=query) |
            Q(description__icontains=query)
        )
        results['clubs'] = ClubListSerializer(clubs, many=True).data
    
    return Response(results)

