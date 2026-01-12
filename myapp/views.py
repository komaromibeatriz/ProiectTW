import re
import json

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Count

from .models import Event, Application


EMAIL_REGEX = re.compile(r"^[a-z]+\.[a-z]+[0-9]{0,2}@e-uvt\.ro$", re.I)
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9._-]{3,30}$")


# ---------- AUTH ----------
def login_view(request):
    if request.method == "POST":
        username = (request.POST.get("username") or "").strip()
        password = request.POST.get("password") or ""
        selected_role = request.POST.get("role")  # organizer / participant

        user = authenticate(request, username=username, password=password)
        if not user:
            return render(request, "html/login.html", {"error": "Username sau parola incorectă"})

        is_organizer = user.groups.filter(name="organizer").exists()
        is_participant = user.groups.filter(name="participant").exists()

        # fallback pentru conturi vechi
        if not is_organizer and not is_participant:
            is_participant = True

        if selected_role == "organizer" and not is_organizer:
            return render(request, "html/login.html", {"error": "Contul tău este User, nu Organizer."})

        if selected_role == "participant" and not is_participant:
            return render(request, "html/login.html", {"error": "Contul tău este Organizer, nu User."})

        auth_login(request, user)
        if is_organizer:
            return redirect("organizerAccount")
        return redirect("userHome")

    return render(request, "html/login.html")


def register(request):
    if request.method == "POST":
        username = (request.POST.get("username") or "").strip()
        email = (request.POST.get("email") or "").strip()
        password = request.POST.get("password") or ""
        role = request.POST.get("role")  # organizer / participant

        if not USERNAME_REGEX.match(username):
            return render(request, "html/register.html", {"error": "Username invalid (min 3 caractere, doar litere/cifre și . _ -)"})

        if not EMAIL_REGEX.match(email):
            return render(request, "html/register.html", {"error": "Email invalid (ex: mario.popescu01@e-uvt.ro)"})

        if not PASSWORD_REGEX.match(password):
            return render(request, "html/register.html", {"error": "Parola invalidă (min 7, literă mare+mică, cifră, simbol)"})

        if User.objects.filter(username=username).exists():
            return render(request, "html/register.html", {"error": "Username deja folosit"})

        if User.objects.filter(email=email).exists():
            return render(request, "html/register.html", {"error": "Email deja folosit"})

        user = User.objects.create_user(username=username, email=email, password=password)

        organizer_group, _ = Group.objects.get_or_create(name="organizer")
        participant_group, _ = Group.objects.get_or_create(name="participant")

        if role == "organizer":
            user.groups.add(organizer_group)
        else:
            user.groups.add(participant_group)

        return redirect("login")

    return render(request, "html/register.html")

from django.db.models import Count

@login_required(login_url="login")
def userHome(request):
    qs = (
        Event.objects.all()
        .order_by("-created_at")
        .annotate(app_count=Count("applications"))  # <-- IMPORTANT: applications, nu application
        .values(
            "id", "title", "category", "date", "time",
            "location", "capacity", "description", "organizer_id", "app_count"
        )
    )
    events = list(qs)

    my_apps = list(
        Application.objects.filter(user=request.user)
        .values_list("event_id", flat=True)
    )

    organizer_ids = Event.objects.values_list("organizer_id", flat=True).distinct()
    organizers = list(User.objects.filter(id__in=organizer_ids).values("id", "username"))

    return render(request, "html/userHome.html", {
        "events": events,
        "organizers": organizers,
        "user_apps": my_apps,
    })


@login_required(login_url="login")
def organizerAccount(request):
    return render(request, "html/organizerAccount.html")


@login_required(login_url="login")
def createEvent(request):
    return render(request, "html/createEvent.html")

@login_required(login_url="login")
def organizer_profile(request, organizer_id):
    organizer = get_object_or_404(User, id=organizer_id)

    # IMPORTANT: "applications" (NU "application")
    events = list(
        Event.objects
        .filter(organizer_id=organizer_id)
        .annotate(applied_count=Count("applications"))
        .order_by("-created_at")
        .values(
            "id", "title", "category", "date", "time", "location",
            "capacity", "description", "created_at", "applied_count"
        )
    )

    # ce aplicații are userul curent (ca să știm Apply/Cancel în profil)
    my_apps = list(
        Application.objects.filter(user=request.user)
        .values_list("event_id", flat=True)
    )

    return render(request, "html/organizerProfile.html", {
        "organizer": organizer,
        "events": events,
        "user_apps": my_apps,
    })

# ---------- EVENTS API ----------
@require_http_methods(["GET", "POST"])
@login_required(login_url="login")
def api_events(request):
    if request.method == "GET":
        events = list(Event.objects.all().values())
        return JsonResponse({"events": events}, status=200)

    # POST create
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON invalid"}, status=400)

    event = Event.objects.create(
        organizer=request.user,
        title=data.get("title", "").strip(),
        category=data.get("category", ""),
        date=data.get("date", ""),
        time=data.get("time", ""),
        location=data.get("location", "").strip(),
        description=data.get("description", "").strip(),
        capacity=data.get("capacity") or 0,
    )

    return JsonResponse({"id": event.id}, status=201)


@require_http_methods(["PUT", "DELETE"])
@login_required(login_url="login")
def api_event_detail(request, event_id):
    event = get_object_or_404(Event, id=event_id)

    # opțional: doar organizer-ul are voie să editeze/șteargă
    if event.organizer_id != request.user.id:
        return JsonResponse({"error": "Nu ai permisiune."}, status=403)

    if request.method == "DELETE":
        event.delete()
        return JsonResponse({"ok": True}, status=200)

    # PUT update
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON invalid"}, status=400)

    event.title = (data.get("title", event.title) or "").strip()
    event.category = data.get("category", event.category)
    event.date = data.get("date", event.date)
    event.time = data.get("time", event.time)
    event.location = (data.get("location", event.location) or "").strip()
    event.description = (data.get("description", event.description) or "").strip()
    event.capacity = data.get("capacity", event.capacity)

    event.save()
    return JsonResponse({"ok": True}, status=200)


# ---------- APPLY / CANCEL API ----------
@login_required(login_url="login")
@require_http_methods(["POST", "DELETE"])
def api_toggle_application(request, event_id):
    event = get_object_or_404(Event, id=event_id)

    if request.method == "POST":
        # dacă e deja aplicat -> ok
        if Application.objects.filter(user=request.user, event=event).exists():
            app_count = Application.objects.filter(event=event).count()
            capacity = event.capacity or 0
            full = (capacity > 0 and app_count >= capacity)
            return JsonResponse(
                {"applied": True, "app_count": app_count, "capacity": capacity, "full": full},
                status=200
            )

        # capacity check (IMPORTANT)
        capacity = event.capacity or 0
        app_count = Application.objects.filter(event=event).count()
        if capacity > 0 and app_count >= capacity:
            return JsonResponse(
                {"error": "Event is full.", "applied": False, "app_count": app_count, "capacity": capacity, "full": True},
                status=409
            )

        Application.objects.create(user=request.user, event=event)
        app_count = Application.objects.filter(event=event).count()
        full = (capacity > 0 and app_count >= capacity)
        return JsonResponse(
            {"applied": True, "app_count": app_count, "capacity": capacity, "full": full},
            status=200
        )

    # DELETE
    Application.objects.filter(user=request.user, event=event).delete()
    app_count = Application.objects.filter(event=event).count()
    capacity = event.capacity or 0
    full = (capacity > 0 and app_count >= capacity)
    return JsonResponse(
        {"applied": False, "app_count": app_count, "capacity": capacity, "full": full},
        status=200
    )
