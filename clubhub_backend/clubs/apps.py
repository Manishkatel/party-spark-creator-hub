
from django.apps import AppConfig


class ClubsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'clubs'
    verbose_name = 'University Clubs'

    def ready(self):
        # Import signals if you have any
        # import clubs.signals
        pass
    