from django.urls import path
from . import views

urlpatterns = [
    path("homepage.html", views.homepage, name="homepage"),
    path("", views.homepage, name="homepage"),

    path("login.html", views.login_view, name="login"),
    path("register.html", views.register, name="register"),
    path("logout/", views.logout_view, name="logout"),

    path("userHome.html", views.userHome, name="userHome"),
    path("organizerAccount.html", views.organizerAccount, name="organizerAccount"),
    path("createEvent.html", views.createEvent, name="createEvent"),

    path("api/events/", views.api_events, name="api_events"),
    path("api/events/<int:event_id>/", views.api_event_detail, name="api_event_detail"),
    path("api/applications/<int:event_id>/", views.api_toggle_application, name="api_toggle_application"),

    path("api/events/<int:event_id>/participants.csv", views.api_event_participants_csv, name="api_event_participants_csv"),

    path("organizer/<int:organizer_id>/", views.organizer_profile, name="organizer_profile"),
]