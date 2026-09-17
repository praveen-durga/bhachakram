# References

External sources consulted while implementing this project's astrological
calculations. Kept separate from `README.md` so the project setup docs stay
focused on running/building the app.

## Ephemeris library

- [swisseph-wasm](https://github.com/prolaxu/swisseph-wasm) — WebAssembly port
  of the Swiss Ephemeris library. This project loads it from its CDN build
  (`https://cdn.jsdelivr.net/npm/swisseph-wasm@0.1.0/src/swisseph.js`) rather
  than bundling it, and uses it for all planetary longitude, house-cusp,
  and sunrise/sunset (`rise_trans`) calculations.

## Panchang (Yogi/Avayogi, Hora, Mandi/Gulika)

- Brihat Parashara Hora Shastra (BPHS), Chapter 3 (~sloka 66-70) — primary
  classical source for Mandi/Gulika's 8-part day/night division and the
  "Ascendant at start of Saturn's portion" rule; also confirms Gulika and
  Mandi are the same point.
- [AstroSaxena — Concept of Yogi, Avayogi and Duplicate Yogi Planet](https://www.astrosaxena.com/articles/yady) —
  worked numeric example for the Yogi Point formula (Sun + Moon + 93°20'),
  used to verify this app's implementation to floating-point precision.
- [Applied Vedic Astrology — Points of Wealth: Luck of the Yogi and the Yogi Point](https://www.appliedvedicastrology.com/point-of-wealth-luck-of-the-yogi/) —
  Sanjay Rath school framing of the Yogi Point/Nitya Yoga concept.
- [BP Lama Jyotishavidya — Yogi Point, Avayogi, Yogi Graha](https://barbarapijan.com/bpa/Amsha/yogi_point_avayogi.htm) —
  states the Avayogi offset (Yogi Point + 186°40') in the same classical
  phrasing verified against this app's data.
- [Jagannatha Hora 7.4 changelog](https://www.vedicastrologer.org/jh/update_7.4.htm) —
  confirms JHora computes exact Yogi/Avayogi longitudes rather than a
  lookup table, and documents a historical Avayogi sign/offset bug as a
  caution for implementers.
- [PyJHora](https://github.com/naturalstupid/PyJHora) — open-source
  reimplementation of Jagannatha Hora's book-verified algorithms; referenced
  as a ground-truth implementation to diff against if needed.
- Hora (planetary hour) sequencing (Chaldean order, weekday-lord start,
  24-hora cycle) cross-checked against
  [sirauysal.com/en/planetary-hours](https://sirauysal.com/en/planetary-hours),
  [kerykeion.net](https://kerykeion.net/), and skoolofforecasting.com.

## Shadbala and Bhava Bala (researched, not yet implemented)

- Brihat Parashara Hora Shastra (BPHS), Chapters 27-28 — primary source for
  Sthana/Dig/Kaala/Chesta/Naisargika/Drig Bala and Ishta/Kashta Phala.
- [Saravali](https://saravali.github.io/astrology/) — open calculation-engine
  reference for Sthana Bala, Dig Bala, and Drig Bala's angular formulas.
- VedAstro "Graha and Bhava Balas" blog series (vedastro.org) — detailed
  modern derivations for Kaala Bala's 9 sub-components and Drig Bala.
- Vijayalur / JYOTHISHI blog series (vijayalur.com) — Kendradi/Drekkana/
  Ojhayugma Bala tables and Mandi's 8-part division tables.
- `shadbala.pdf` (project root) — a real Parashara's Light 9.0 software
  report, used as the numeric verification target for the formulas above.

## Planet Positions

- Reference implementation ported from an existing sibling project
  (`astroParseTable` feature) for the 9-graha + Ascendant table,
  Nakshatra/Pada, Rasi Combination, Karmic Dosha, and Karmic Planet logic —
  not a public external source, kept here for completeness of provenance.

### Special points (Mandi, Hora Lagna, Bhrigu Bindu, Upagrahas, Indu Lagna)

- Brihat Parashara Hora Shastra (BPHS), Chapter 5, v.2-8 — Bhava Lagna,
  Hora Lagna, and Ghatika Lagna's "repeats every N ghatis from sunrise,
  added to Surya's longitude at sunrise" formulas. Only Hora Lagna is
  implemented (v.4-5); Bhava Lagna/Ghatika Lagna weren't requested.
- Brihat Parashara Hora Shastra (BPHS), Chapter 3, v.61-64 — the 5
  Sun-longitude-based Upagrahas (Dhuma, Vyatipata, Parivesha, Chapa/
  Indrachapa, Upaketu), each defined as a fixed offset from the previous.
- Brihat Parashara Hora Shastra (BPHS), Chapter 3, v.66-69 — Gulika/Mandi
  and 4 more time-portion-based Upagrahas (Kaala, Mrityu, Yamaghantaka,
  Ardhaprahara) via an 8-part day/night division. Only Mandi/Gulika is
  implemented, reusing the Panchang feature's already-verified 15-muhurta
  replacement for that 8-part method (see the Panchang section above) —
  the other 4 were deliberately left out since they share the same
  8-part method already found unreliable for Gulika, and no equivalent
  verified replacement exists for them yet.
- Bhrigu Bindu (Moon-Rahu midpoint, shorter arc) and Indu Lagna (Kalanadi
  table + 9th-lord-from-Ascendant-and-Moon counting rule) are NOT in BPHS
  — later Jyotish additions. Implemented from general background
  knowledge, not a fresh citation (web search was intermittently
  unavailable during this session) — Indu Lagna in particular is flagged
  as best-effort in the UI (`*`) per the user's explicit choice to
  proceed without independent verification of its Kalanadi table.

### Jaimini Chara Karakas

- Ranking rule (degree-within-sign descending, Atmakaraka highest down
  to Darakaraka lowest, 7-planet scheme per the user's explicit choice)
  and the retrograde-handling rule (regular planets rank by their
  degree as-is; the "30 minus degree" adjustment is specific to Rahu in
  the 8-planet scheme) both cross-checked against 2 independent web
  sources that agree with each other. Also verified end-to-end against
  the user's own reference screenshot's exact ranking order.

## Planet Comfort

- Not a classical text — a scoring framework the user wrote out in full
  (Guna compatibility, specific-enemy penalty, Yogakaraka/Subhakaraka
  uplift, 0-40 scale, 4 bands). The written spec had several internal
  contradictions (SK's point value stated as both +5 and +6; a "Group
  Uplift" mentioned in worked examples but not formally defined). Every
  rule was instead reverse-verified against the user's own reference
  image (a real computed table) before implementing — see
  `.claude/todo-plans/17-planet-comfort-route.md` for the full
  verification trail, including 2 rounds of clarifying questions and
  one disclosed 1-point discrepancy against a single worked example
  that doesn't match the real reference table or the other 3 examples.
- Reuses `getNakshatraLord`'s Vimshottari lord cycle (already verified
  for Panchang) and the modern Rahu=Aquarius/Ketu=Scorpio co-rulership
  convention (already verified for Vargas' Graha Arudha feature) rather
  than re-deriving either.

## Ashtaka Varga

- Classical Parashara Bhinnashtakavarga/Sarvashtakavarga (8 contributors:
  7 planets + Lagna; Rahu/Ketu excluded, per the standard scheme). The
  primary source (BPHS via archive.org) truncates before its Ashtakavarga
  chapters' tables, so the 7 bindu-contribution tables (56 cells total)
  were verified against 2 independent secondary sources
  ([myzodiaq.in](https://www.myzodiaq.in/en/online-library/basics-of-vedic-astrology/ashtakvarga/ashtakavarga-calculation-the-complete-step-by-step-guide-to-cosmic-scoring),
  [vedastro.org "Mastering Ashtakavarga"](https://vedastro.org/blog/Mastering-Ashtakavarga-Part-2-Building-Bhinnashtakavarga-Charts.html))
  and cross-checked against the well-known classical per-planet totals
  (Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39;
  sum 337) — see `.claude/todo-plans/18-ashtakavarga-route.md` for the 2
  single-cell discrepancies found and resolved this way (Moon's and
  Venus's Lagna rows), and the Node validation (table arithmetic + a
  2,000-trial invariant sweep confirming SAV always totals 337).
- **Lagna's own BAV (8th mini-chart, added on request) is NOT classical.**
  In the Parashara scheme Lagna is only ever a contributor to the 7 planets'
  charts, never a target with its own Bhinnashtakavarga — no source found
  presents a genuine, independently-verifiable table for it (no reference
  total to check arithmetic against, unlike the 7 planets). Flagged this to
  the user before implementing; per their choice, it's included as a
  best-effort table (pieced together from secondary-source fragments, row
  sums to 51 — informational only, not a verified classical total) and
  marked with `*` in the UI, same convention as Indu Lagna and Vargas'
  D3J/D3S.
