│   .gitignore
│   .tables
│   db.sqlite3
│   manage.py
│
├───demo
│   │   asgi.py
│   │   settings.py
│   │   urls.py
│   │   wsgi.py
│   │   __init__.py
│   │
│   └───__pycache__
│           settings.cpython-313.pyc
│           urls.cpython-313.pyc
│           wsgi.cpython-313.pyc
│           __init__.cpython-313.pyc
│
└───myapp
    │   admin.py
    │   apps.py
    │   models.py
    │   tests.py
    │   urls.py
    │   views.py
    │   __init__.py
    │
    ├───migrations
    │   │   0001_initial.py
    │   │   0002_alter_application_user.py
    │   │   0003_organizerreview.py
    │   │   __init__.py
    │   │
    │   └───__pycache__
    │           0001_initial.cpython-313.pyc
    │           0002_alter_application_user.cpython-313.pyc
    │           0003_organizerreview.cpython-313.pyc
    │           __init__.cpython-313.pyc
    │
    ├───static
    │   ├───CSS
    │   │       homepage.css
    │   │       login.css
    │   │       organizerAccount.css
    │   │       organizerProfile.css
    │   │       register.css
    │   │       style.css
    │   │       userHome.css
    │   │
    │   ├───Images
    │   │       logo.png
    │   │
    │   └───JS
    │           createEvent.js
    │           login.js
    │           organizerProfile.js
    │           profile.js
    │           register.js
    │           userHome.js
    │
    ├───templates
    │   └───html
    │           createEvent.html
    │           homepage.html
    │           login.html
    │           organizerAccount.html
    │           organizerProfile.html
    │           register.html
    │           userHome.html
    │
    └───__pycache__
            admin.cpython-313.pyc
            apps.cpython-313.pyc
            models.cpython-313.pyc
            urls.cpython-313.pyc
            views.cpython-313.pyc
            __init__.cpython-313.pyc

            Descrierea scopului aplicatiei
Smart Events este o aplicatie web simpla care permite gestionarea si explorarea evenimentelor IT. Aplicatia are doua roluri principale:

Organizer – poate crea, edita si sterge evenimente.

Participant (User) – poate explora evenimentele din lista, se poate inscrie la evenimente, isi poate vedea inscrierile si poate cauta evenimente sau organizatori.

Scopul proiectului este sa ofere o platforma minimalista de gestionare a evenimentelor, care foloseste momentan doar HTML, CSS si JavaScript. Toate datele sunt salvate in LocalStorage. 2. Instructiuni de rulare Se ruleaza fisierele HTML direct in browser (de exemplu login.html, organizerAccount.html, userHome.html)

Tehnologii utilizate
HTML – structura paginilor (login, register, organizer account, create event, user home).

CSS – stilurile aplicatiei (culori, responsive layout ).

JavaScript – functionalitatile aplicatiei:

a.logare si selectie rol

b.creare evenimente

c.editare profil organizator

d. aplicare / anulare aplicare la evenimente

e.cautare evenimente si organizatori

f.salvare date in LocalStorage

Functionalitati deja implementate
Pentru organizator

-Creare eveniment (titlu, categorie, data, ora, locatie, capacitate, descriere).

-Afisarea listei de evenimente create.

-Editarea profilului propriu (nume, username, descriere).

-Salvarea datelor profilului in LocalStorage.

-Salvarea evenimentelor in LocalStorage.

-Butoane de Modify si Delete (functionalitate planificata).

Pentru utilizator

-Pagina principala pentru explorarea evenimentelor – userHome.html

Afisarea tuturor evenimentelor create de organizatori.

-Aplicare si anulare aplicare la evenimente.

-Vizualizare tab dedicat cu “Evenimentele mele”.

-Sistem de tab-uri pentru navigare intre: Evenimente, Aplicarile mele, Cautare evenimente, Cautare organizatori

-Cautare evenimente dupa titlu, categorie, locatie.

-Cautare organizatori dupa nume sau username.

-Salvarea inscrierilor in LocalStorage.

Functionalitati ramase de implementat
-Imbunatatirea paginilor utilizatorului si a organizatorului

Django
Structura proiectului /HTML login.html register.html organizerAccount.html createEvent.html userHome.html register.html
/CSS style.css organizerAccount.css login.css register.css /JS login.js profile.js createEvent.js userHome.js register.js
