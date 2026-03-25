1. Nie stylujcie kolorów i zobaczcie jak wyglada z domyślnymi w obu trybach
2. Jak coś nie pasuje to dodajecie manualnie kolor - najlepiej poprzez zmienne a nie np. bg-yellow-300 bo wtedy łatwiej zmodyfikować styl ( sam to tez robilem ten blad bede musial niektore rzeczy poprawic)
3. Dodajecie styl w dark modzie poprzez dodanie przedrostek dark: np. defaultowy styl jasny wam odpowiada a ciemny kolor nie dajecie dark:bg-xyz
4. Najlepiej nie mieszac zmiennych i normalnych kolorow w jednym (np. bg-primary dark: bg-white-100), chyba że jakiś specyficzny wypadek

5. DISCLAIMER: W trakcie wdrażania dark mode część poprawek była robiona manualnie (utility colors), żeby szybciej domknąć, docelowo to zrefaktorowac do zmiennych zeby utrzymac spojnosc i latwiejsze zmiany kolorkow + moze mini revamp zmiennych by sie przydal zobaczyć co tak naprawde uzywany a co jest useless/brakuje

Dobra praktyka na teraz:

Nowe komponenty już rób tylko na zmiennych.
Stare manualne kolory poprawiaj przy okazji zmian w danym widoku.
Nie blokuj feature przez pełny refaktor, ale zostawiaj po sobie mniej manualnych kolorów niż było.
