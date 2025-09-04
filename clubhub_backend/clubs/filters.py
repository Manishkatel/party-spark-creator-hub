import django_filters
from django.db.models import Q
from .models import Event, Club


class EventFilter(django_filters.FilterSet):
    # Price filtering
    price_type = django_filters.ChoiceFilter(
        choices=[('free', 'Free'), ('paid', 'Paid')],
        method='filter_price_type',
        label='Price Type'
    )
    
    # Date range filtering
    date_from = django_filters.DateFilter(
        field_name='event_date',
        lookup_expr='gte',
        label='Date From'
    )
    date_to = django_filters.DateFilter(
        field_name='event_date',
        lookup_expr='lte',
        label='Date To'
    )
    
    # Event type filtering
    event_type = django_filters.ChoiceFilter(
        choices=Event.EVENT_TYPE_CHOICES,
        label='Event Type'
    )
    
    # Virtual/Real filtering
    is_virtual = django_filters.ChoiceFilter(
        choices=Event.VIRTUAL_CHOICES,
        label='Event Mode'
    )
    
    # Club type filtering (filter events by their affiliated club's type)
    club_type = django_filters.ChoiceFilter(
        field_name='affiliated_club__club_type',
        choices=Club.CLUB_TYPE_CHOICES,
        label='Club Type'
    )
    
    # Multi-category filtering
    categories = django_filters.MultipleChoiceFilter(
        choices=Event.EVENT_TYPE_CHOICES,
        field_name='event_type',
        conjoined=False,  # OR logic
        label='Categories'
    )
    
    class Meta:
        model = Event
        fields = []
    
    def filter_price_type(self, queryset, name, value):
        if value == 'free':
            return queryset.filter(price=0)
        elif value == 'paid':
            return queryset.filter(price__gt=0)
        return queryset


class ClubFilter(django_filters.FilterSet):
    # Club type filtering
    club_type = django_filters.ChoiceFilter(
        choices=Club.CLUB_TYPE_CHOICES,
        label='Club Type'
    )
    
    # Multi-category filtering
    categories = django_filters.MultipleChoiceFilter(
        choices=Club.CLUB_TYPE_CHOICES,
        field_name='club_type',
        conjoined=False,  # OR logic
        label='Categories'
    )
    
    # Filter by number of events
    min_events = django_filters.NumberFilter(
        method='filter_min_events',
        label='Minimum Events'
    )
    
    # Filter by number of members
    min_members = django_filters.NumberFilter(
        method='filter_min_members',
        label='Minimum Members'
    )
    
    class Meta:
        model = Club
        fields = []
    
    def filter_min_events(self, queryset, name, value):
        if value is not None:
            return queryset.annotate(
                events_count=django_filters.Count('events')
            ).filter(events_count__gte=value)
        return queryset
    
    def filter_min_members(self, queryset, name, value):
        if value is not None:
            return queryset.annotate(
                members_count=django_filters.Count('members')
            ).filter(members_count__gte=value)
        return queryset


class CombinedSearchFilter(django_filters.FilterSet):
    """
    Combined filter for searching both events and clubs
    """
    search_type = django_filters.ChoiceFilter(
        choices=[
            ('events', 'Events'),
            ('clubs', 'Clubs'),
            ('all', 'All')
        ],
        label='Search Type'
    )
    
    price_type = django_filters.ChoiceFilter(
        choices=[('free', 'Free'), ('paid', 'Paid')],
        label='Price Type (Events Only)'
    )
    
    date_from = django_filters.DateFilter(
        label='Date From (Events Only)'
    )
    
    date_to = django_filters.DateFilter(
        label='Date To (Events Only)'
    )
    
    categories = django_filters.MultipleChoiceFilter(
        choices=Event.EVENT_TYPE_CHOICES + Club.CLUB_TYPE_CHOICES,
        conjoined=False,
        label='Categories'
    )