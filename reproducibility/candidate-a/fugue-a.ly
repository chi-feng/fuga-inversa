\version "2.26.0"
\pointAndClickOff
\header {
  title = "Fuga sopra il LICC inverso"
  subtitle = "a 3 voci — per un solo manuale"
  composer = "Original composition"
  tagline = ##f
}
\paper {
  #(set-paper-size "a4")
  top-margin = 12\mm
  bottom-margin = 12\mm
  left-margin = 15\mm
  right-margin = 15\mm
  ragged-last-bottom = ##f
  system-system-spacing.basic-distance = #17
  system-system-spacing.minimum-distance = #13
}
global = { \key d \minor \time 4/4 \tempo "Andante con moto" 4 = 84 }
sopranoMusic = \absolute {
  % 1
  d''8 c''8 b'8 a'8 c''4 e''8 d''8 |
  % 2
  cis''8 d''8 e''8 cis''8 d''4 a'4 |
  % 3
  e''4 fis''4 e''4 d''4 |
  % 4
  e''4 d''4 c''2 | \break
  % 5
  f''4 d''8 e''8 e''2 |
  % 6
  a'4 bes'4 a'4 cis''4 |
  % 7
  f''8 e''8 f''8 d''8 g''8 f''8 g''8 e''8 |
  % 8
  e''8 d''8 e''8 c''8 f''8 e''8 f''8 d''8 | \break
  % 9
  d''8 c''8 d''8 bes'8 e''8 d''8 e''8 cis''8 |
  % 10
  d''8 e''8 f''8 d''8 fis''8 e''8 fis''8 g''8 |
  % 11
  d''4 c''8 b'8 a'4 c''4 |
  % 12
  a'4 d''2. | \break
  % 13
  d''8 c''8 b'8 a'8 c''4 e''8 d''8 |
  % 14
  cis''8 d''8 e''8 cis''8 d''4 a'4 |
  % 15
  c''4 d''4 f''4 d''4 |
  % 16
  e''4 c''2. | \break
  % 17
  a'2 bes'4 c''4 |
  % 18
  bes'4 bes'4 a'2 |
  % 19
  a'4 b'4 a'4 g'4 |
  % 20
  a'4 bes'4 a'4 cis''4 | \break
  % 21
  d''8 c''8 b'8 a'8 c''4 e''8 d''8 |
  % 22
  cis''8 d''8 e''8 cis''8 d''2 |
  % 23
  f''4 g''8 f''8 e''4 g''4 |
  % 24
  e''4 g''4 f''4 c''4 | \break
  % 25
  ees''2 d''4 cis''4 |
  % 26
  d''8 c''8 b'8 a'8 c''4 e''8 d''8 |
  % 27
  cis''8 d''8 e''8 cis''8 d''4 cis''4 |
  % 28
  d''1\fermata \bar "|."
}

altoMusic = \absolute {
  % 1
  r1 |
  % 2
  r1 |
  % 3
  a'8 g'8 fis'8 e'8 g'4 b'8 a'8 |
  % 4
  gis'8 a'8 b'8 gis'8 a'4 e'4 | \break
  % 5
  a'4 b'8 c''8 a'4 g'4 |
  % 6
  e'4 g'4 f'4 a'4 |
  % 7
  a'4 d''4 d''4 bes'4 |
  % 8
  bes'2 a'2 | \break
  % 9
  bes'4 f'4 g'2 |
  % 10
  f'4 a'2. |
  % 11
  g'8 f'8 e'8 d'8 f'4 a'8 g'8 |
  % 12
  fis'8 g'8 a'8 fis'8 g'4 d'4 | \break
  % 13
  f'4 g'8 e'8 e'4 g'4 |
  % 14
  e'4 g'4 f'2 |
  % 15
  a'8 g'8 a'8 f'8 bes'8 a'8 bes'8 g'8 |
  % 16
  g'8 f'8 g'8 e'8 a'8 g'8 a'8 f'8 | \break
  % 17
  f'8 e'8 f'8 d'8 g'8 f'8 g'8 e'8 |
  % 18
  e'8 f'8 g'8 e'8 f'8 e'8 d'8 cis'8 |
  % 19
  f'4 d'8 e'8 e'2 |
  % 20
  e'4 g'4 f'4 a'4 | \break
  % 21
  f'4 g'8 e'8 e'4 g'4 |
  % 22
  e'4 g'4 f'4 a'4 |
  % 23
  d''8 c''8 b'8 a'8 c''4 e''8 d''8 |
  % 24
  cis''8 d''8 e''8 cis''8 d''4 a'4 | \break
  % 25
  bes'2 a'4 g'4 |
  % 26
  f'4 g'8 e'8 e'4 g'4 |
  % 27
  e'4 g'4 f'4 g'4 |
  % 28
  fis'1\fermata \bar "|."
}

bassMusic = \absolute {
  % 1
  r1 |
  % 2
  r1 |
  % 3
  r1 |
  % 4
  r1 | \break
  % 5
  d8 c8 b,8 a,8 c4 e8 d8 |
  % 6
  cis8 d8 e8 cis8 d4 a,4 |
  % 7
  d4 f4 bes,4 g4 |
  % 8
  c4 g,4 a,4 f4 | \break
  % 9
  bes,4 d4 a,2 |
  % 10
  d2. c4 |
  % 11
  bes,4 c8 g8 d4 a,4 |
  % 12
  d4 c4 bes,4 d4 | \break
  % 13
  d4 g,8 a,8 a,4 g,4 |
  % 14
  a,2 d4 f4 |
  % 15
  f4 d4 bes,2 |
  % 16
  c4 e4 f4 a,4 | \break
  % 17
  d4 a,4 g,4 c4 |
  % 18
  g4 c4 d4 a,4 |
  % 19
  d8 c8 b,8 a,8 c4 e8 d8 |
  % 20
  cis8 d8 e8 cis8 d4 a,4 | \break
  % 21
  d4 g,8 a,8 a,4 g,4 |
  % 22
  a,2 d4 f4 |
  % 23
  d4 g8 a8 a4 e4 |
  % 24
  e4 a,4 d4 f4 | \break
  % 25
  g2 a2 |
  % 26
  d4 g,8 a,8 a,4 g,4 |
  % 27
  a,2 d4 a,4 |
  % 28
  d1\fermata \bar "|."
}

\score {
  \new PianoStaff \with { instrumentName = "Organo" } <<
    \new Staff = "manualRight" \with { midiInstrument = "church organ" } <<
      \clef treble
      \new Voice = "Soprano" { \voiceOne \global \sopranoMusic }
      \new Voice = "Alto" { \voiceTwo \global \altoMusic }
    >>
    \new Staff = "manualLeft" \with { midiInstrument = "church organ" } <<
      \clef bass
      \new Voice = "Bass" { \oneVoice \global \bassMusic }
    >>
  >>
  \layout {
    \context { \Score \accidentalStyle piano }
  }
  \midi { \context { \Score midiChannelMapping = #'voice } }
}
