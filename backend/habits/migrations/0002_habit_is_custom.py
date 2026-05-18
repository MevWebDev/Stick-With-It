from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('habits', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # IF NOT EXISTS makes this safe for both fresh and existing databases
            database_operations=[
                migrations.RunSQL(
                    sql="ALTER TABLE habits_habit ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false NOT NULL",
                    reverse_sql="ALTER TABLE habits_habit DROP COLUMN IF EXISTS is_custom",
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='habit',
                    name='is_custom',
                    field=models.BooleanField(default=False),
                ),
            ],
        ),
    ]
