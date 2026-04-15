## workflow migracji (dev)

1. uruchom backend: `docker compose up --build`
2. po zmianach modeli wygeneruj migracje tylko dla danej appki, np.:
	`docker compose exec web python3 manage.py makemigrations habits`
3. uruchom migracje:
	`docker compose exec web python3 manage.py migrate`

## reset bazy (opcja A, gdy nie ma cennych danych)

1. zatrzymaj stack i usuń wolumeny:
	`docker compose down -v`
2. uruchom stack od nowa:
	`docker compose up --build`
3. wygeneruj migracje i odpal migrate jak wyżej.
