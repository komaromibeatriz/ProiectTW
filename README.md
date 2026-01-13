<img width="405" height="956" alt="image" src="https://github.com/user-attachments/assets/2309b4cf-5518-451b-9e10-71a59b475024" />


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
