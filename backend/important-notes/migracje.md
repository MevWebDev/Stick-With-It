## na start bo zmianach w backendzie

1. odpalić backend przez docker compose up --build
2. w osobnym terminalu puścić komendę docker `docker compose exec web python3 manage.py makemigrations`
3. następnie puścić komendę `docker compose exec web python3 manage.py migrate  `
