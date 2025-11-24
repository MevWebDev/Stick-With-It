from django.core.management.base import BaseCommand
from accounts.models import Challenge

class Command(BaseCommand):
    help = 'Seeds the database with initial challenges'

    def handle(self, *args, **kwargs):
        challenges_data = [
            # Health & Fitness
            {"title": "Spacer 30 min", "category": "Health", "description": "Idź na 30-minutowy spacer na świeżym powietrzu.", "difficulty": 1},
            {"title": "Bez cukru", "category": "Health", "description": "Nie jedz słodyczy przez cały dzień.", "difficulty": 2},
            {"title": "Trening siłowy", "category": "Health", "description": "Wykonaj 45-minutowy trening siłowy.", "difficulty": 3},
            {"title": "8 szklanek wody", "category": "Health", "description": "Wypij przynajmniej 2 litry wody.", "difficulty": 1},
            {"title": "Joga o poranku", "category": "Health", "description": "Zrób 15 minut jogi lub rozciągania rano.", "difficulty": 1},

            # Productivity
            {"title": "Zero social media", "category": "Productivity", "description": "Nie wchodź na social media przez cały dzień.", "difficulty": 3},
            {"title": "Plan dnia", "category": "Productivity", "description": "Zaplanuj zadania na następny dzień.", "difficulty": 1},
            {"title": "Czyste biurko", "category": "Productivity", "description": "Uporządkuj swoje miejsce pracy.", "difficulty": 1},
            {"title": "Deep Work", "category": "Productivity", "description": "Pracuj w skupieniu przez 2 godziny bez przerwy.", "difficulty": 2},
            {"title": "Inbox Zero", "category": "Productivity", "description": "Wyczyść skrzynkę mailową.", "difficulty": 2},

            # Education & Growth
            {"title": "Czytaj 20 min", "category": "Education", "description": "Przeczytaj rozdział książki.", "difficulty": 1},
            {"title": "Naucz się słówka", "category": "Education", "description": "Naucz się 5 nowych słówek w obcym języku.", "difficulty": 1},
            {"title": "Obejrzyj TED", "category": "Education", "description": "Obejrzyj wartościowy wykład lub dokument.", "difficulty": 1},
            {"title": "Nowa umiejętność", "category": "Education", "description": "Poświęć 30 min na naukę nowej umiejętności.", "difficulty": 2},
            {"title": "Artykuł naukowy", "category": "Education", "description": "Przeczytaj artykuł naukowy z Twojej dziedziny.", "difficulty": 2},

            # Mindfulness & Mental
            {"title": "Medytacja", "category": "Mindfulness", "description": "Medytuj przez 10 minut.", "difficulty": 1},
            {"title": "Dziennik wdzięczności", "category": "Mindfulness", "description": "Zapisz 3 rzeczy, za które jesteś wdzięczny.", "difficulty": 1},
            {"title": "Cyfrowy detoks", "category": "Mindfulness", "description": "Odłóż telefon na 2 godziny przed snem.", "difficulty": 2},
            {"title": "Zimny prysznic", "category": "Mindfulness", "description": "Weź zimny prysznic rano.", "difficulty": 3},
            {"title": "Spacer bez telefonu", "category": "Mindfulness", "description": "Idź na spacer bez elektroniki.", "difficulty": 2},
        ]

        created_count = 0
        for data in challenges_data:
            challenge, created = Challenge.objects.get_or_create(
                title=data['title'],
                defaults={
                    'category': data['category'],
                    'description': data['description'],
                    'difficulty': data['difficulty']
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} challenges.'))
