from django.urls import path
from . import views

urlpatterns = [
    # AUTH & PAGES
    path("", views.login_view, name="login"),
    path("login.html", views.login_view, name="login"),
    path("register.html", views.register, name="register"),

    path("userHome.html", views.userHome, name="userHome"),
    path("organizerAccount.html", views.organizerAccount, name="organizerAccount"),
    path("createEvent.html", views.createEvent, name="createEvent"),

    # EVENTS API
    path("api/events/", views.api_events, name="api_events"),
    path("api/events/<int:event_id>/", views.api_event_detail, name="api_event_detail"),

    # APPLICATIONS (Apply / Cancel)
    path(
        "api/applications/<int:event_id>/",
        views.api_toggle_application,
        name="api_toggle_application"
    ),

    # ORGANIZER PROFILE
    path(
        "organizer/<int:organizer_id>/",
        views.organizer_profile,
        name="organizer_profile"
    ),
]
