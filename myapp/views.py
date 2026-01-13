import re
import json
import csv

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Count, Exists, OuterRef, Avg

from .models import Event, Application, OrganizerReview


EMAIL_REGEX = re.compile(r"^[a-z]+\.[a-z]+[0-9]{0,2}@e-uvt\.ro$", re.I)
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9._-]{3,30}$")


def homepage(request):
    events = Event.objects.all().order_by("-created_at")[:12]
    return render(request, "html/homepage.html", {"events": events})


def login_view(request):
    if request.method == "POST":
        username = (request.POST.get("username") or "").strip()
        password = request.POST.get("password") or ""
        selected_role = request.POST.get("role") 

        user = authenticate(request, username=username, password=password)
        if not user:
            return render(request, "html/login.html", {"error": "Username sau parola incorectă"})

        is_organizer = user.groups.filter(name="organizer").exists()
        is_participant = user.groups.filter(name="participant").exists()

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


def logout_view(request):
    auth_logout(request)
    return redirect("login")


def register(request):
    if request.method == "POST":
        username = (request.POST.get("username") or "").strip()
        email = (request.POST.get("email") or "").strip()
        password = request.POST.get("password") or ""
        role = request.POST.get("role")

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


@login_required(login_url="login")
def userHome(request):
    raw_events = (
        Event.objects
        .select_related("organizer")
        .annotate(applicants_count=Count("applications"))
        .values(
            "id", "title", "category", "date", "time", "location", "capacity", "description",
            "organizer_id", "organizer__username",
            "applicants_count"
        )
    )

    events = []
    for e in raw_events:
        e["organizer_name"] = e.pop("organizer__username", "")
        events.append(e)

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
    
    me = request.user

    my_events = (
        Event.objects
        .filter(organizer=me)
        .annotate(applicants_count=Count("applications"))
        .order_by("-created_at")
    )

    reviews_qs = OrganizerReview.objects.filter(
        organizer=me
    ).select_related("user")

    reviews_stats = reviews_qs.aggregate(avg=Avg("rating"))
    avg_rating = float(reviews_stats["avg"] or 0)
    reviews_count = reviews_qs.count()

    return render(request, "html/organizerAccount.html", {
        "me": me,
        "my_events": my_events,

        "reviews": reviews_qs,
        "avg_rating": avg_rating,
        "reviews_count": reviews_count,
    })



@login_required(login_url="login")
def createEvent(request):
    return render(request, "html/createEvent.html")


@login_required(login_url="login")
def organizer_profile(request, organizer_id):
    organizer = get_object_or_404(User, id=organizer_id)

    if request.method == "POST" and request.POST.get("review_submit"):
        if organizer.id != request.user.id:
            try:
                rating = int(request.POST.get("rating") or 0)
            except ValueError:
                rating = 0

            rating = max(1, min(5, rating)) 
            comment = (request.POST.get("comment") or "").strip()

            OrganizerReview.objects.update_or_create(
                organizer=organizer,
                user=request.user,
                defaults={"rating": rating, "comment": comment},
            )

        return redirect("organizer_profile", organizer_id=organizer_id)

    user_app_exists = Application.objects.filter(
        user=request.user,
        event_id=OuterRef("pk")
    )

    events = (
        Event.objects
        .filter(organizer_id=organizer_id)
        .order_by("-created_at")
        .annotate(
            app_count=Count("applications", distinct=True),
            applied=Exists(user_app_exists)
        )
    )

   
    reviews_qs = OrganizerReview.objects.filter(
        organizer=organizer
    ).select_related("user")

    stats = reviews_qs.aggregate(avg=Avg("rating"))
    avg_rating = float(stats["avg"] or 0)
    reviews_count = reviews_qs.count()

    my_review = OrganizerReview.objects.filter(
        organizer=organizer,
        user=request.user
    ).first()

    return render(request, "html/organizerProfile.html", {
        "organizer": organizer,
        "events": events,

        "reviews": reviews_qs,
        "avg_rating": avg_rating,
        "reviews_count": reviews_count,
        "my_review": my_review,
    })


@require_http_methods(["GET", "POST"])
@login_required(login_url="login")
def api_events(request):
    if request.method == "GET":
        events = list(Event.objects.all().values())
        return JsonResponse({"events": events}, status=200)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON invalid"}, status=400)

    event = Event.objects.create(
        organizer=request.user,
        title=(data.get("title", "") or "").strip(),
        category=data.get("category", ""),
        date=data.get("date", ""),
        time=data.get("time", ""),
        location=(data.get("location", "") or "").strip(),
        description=(data.get("description", "") or "").strip(),
        capacity=data.get("capacity") or 0,
    )

    return JsonResponse({"id": event.id}, status=201)


@require_http_methods(["PUT", "DELETE"])
@login_required(login_url="login")
def api_event_detail(request, event_id):
    event = get_object_or_404(Event, id=event_id)

    if event.organizer_id != request.user.id:
        return JsonResponse({"error": "Nu ai permisiune."}, status=403)

    if request.method == "DELETE":
        event.delete()
        return JsonResponse({"ok": True}, status=200)

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


@login_required(login_url="login")
@require_http_methods(["POST", "DELETE"])
def api_toggle_application(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    user = request.user

    if request.method == "POST":
        app, created = Application.objects.get_or_create(user=user, event=event)
        return JsonResponse({"applied": True, "created": created}, status=200)

    Application.objects.filter(user=user, event=event).delete()
    return JsonResponse({"applied": False}, status=200)


@login_required(login_url="login")
@require_http_methods(["GET"])
def api_event_participants_csv(request, event_id):
    event = get_object_or_404(Event, id=event_id)

    if event.organizer_id != request.user.id:
        return HttpResponse("Forbidden", status=403)

    apps = (
        Application.objects
        .filter(event=event)
        .select_related("user")
        .order_by("user__username")
    )

    participants_count = apps.count()

    filename = f"participants_event_{event.id}.csv"
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    response.write("\ufeff")

    writer = csv.writer(response)
    writer.writerow(["Event", event.title])
    writer.writerow(["Participants", f"{participants_count}/{event.capacity}"])
    writer.writerow([])
    writer.writerow(["#", "username", "email"])

    i = 1
    for a in apps:
        writer.writerow([i, a.user.username, a.user.email])
        i += 1

    return response