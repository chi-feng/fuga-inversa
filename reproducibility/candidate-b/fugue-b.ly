\version "2.26.0"

\header {
  title = "Fugue on an Inverted Cell"
  subtitle = "Three voices for one manual"
  composer = "Original composition · Candidate B"
  tagline = ##f
}

global = { \key d \minor \time 4/4 }

soprano = \absolute {
  \global
  \tempo "Con moto, ma non troppo" 4 = 88
  d''8 c'' b' a' c''4 e''8 d'' |
  f''8 e'' d'' cis'' d''4 a' |
  c''4 d''8 c'' b' c'' d'' c'' |
  e''8 d'' c'' b' c''4 b'8 gis' |
  a'4 d''8 c''~ c''4 r8 d''~ |
  d''8 cis'' d'' a'~ a'2 |
  a'4 d''8 c'' bes' a' g' f' |
  g'4 c''8 bes' a' g' f' e' |
  f'4 bes'8 a' bes'2 |
  a'4. g'8 f'4 a' |
  bes'4 c''8 bes' a' bes' c'' bes' |
  d''8 c'' bes' a' bes'4 a'8 fis' |
  g'4 bes'8 a' g'4 c''8 bes' |
  a'4 c''8 a' b'8 e'' b''4 |
  a''8 g'' fis'' e'' g''4 b''8 a'' |
  c'''8 b'' a'' gis'' a''4 e'' |
  e''4 a''8 g'' f'' e'' d'' c'' |
  d''4 g''8 f'' e'' d'' c'' b' |
  c''4 f''8 e'' d''4 a' |
  b'4 e''8 d'' cis'' b' a'4 |
  a'4 d''8 c''~ c''4 r8 d''~ |
  d''8 cis'' d'' a'~ a'2 |
  a'4 d''8 c'' bes' a' g' f' |
  g'4 bes'8 a'~ a'4 cis'' |
  d''8 c'' b' a' c''4 e''8 d'' |
  f''8 e'' d'' cis'' d''4 f'' |
  ees''2 d''4 cis'' |
  d''1\fermata \bar "|."
}

alto = \absolute {
  \global
  R1*2 |
  a'8 g' fis' e' g'4 b'8 a' |
  c''8 b' a' gis' a'4 e' |
  f'4 g'8 a' e' f' g' f' |
  a'8 g' f' e' f'4 e'8 cis' |
  f'2 d' |
  e'2 c' |
  d'2 bes4 d' |
  cis'2 d'4 fis' |
  g'8 f' e' d' f'4 a'8 g' |
  bes'8 a' g' fis' g'4 d' |
  d'4 d'8 f' e'4 e'8 g' |
  a'4 e' gis' b' |
  c''4 a'8 c'' b' c'' d'' c'' |
  e''8 d'' c'' b' c''4 b'8 gis' |
  c''2 a' |
  b'2 g' |
  a'2 f'4 a' |
  gis'2 a'4 g' |
  f'4 g'8 a' e' f' g' f' |
  a'8 g' f' e' f'4 e'8 cis' |
  f'2 d' |
  d'2 cis'4 e' |
  f'4 d'8 f' e' f' g' f' |
  a'8 g' f' e' f'4 a' |
  bes'2 f'4 e' |
  fis'1\fermata
}

bass = \absolute {
  \global
  R1*4 |
  d8 c b, a, c4 e8 d |
  f8 e d cis d4 a, |
  d2 g |
  c2 f |
  bes,2 g |
  a,2 d |
  g4 a8 bes f4. bes8 |
  bes8 f bes d g4 fis8 d |
  g2 e |
  f4 a gis2 |
  a4 d8 a b4. c'8 |
  a8 b c' e a4 gis8 e |
  a2 d' |
  g2 c' |
  f1 |
  e2 a, |
  d8 c b, a, c4 e8 d |
  f8 e d cis d4 a, |
  d2 g |
  g,2 a, |
  d4 g,8 d e4. f8 |
  d8 e f a, d2 |
  g2 a |
  d1\fermata
}

\paper {
  #(set-paper-size "a4")
  indent = 0\mm
  ragged-last-bottom = ##f
}

\score {
  \new PianoStaff <<
    \new Staff = "upper" \with { midiInstrument = "church organ" } <<
      \new Voice = "Soprano" { \voiceOne \soprano }
      \new Voice = "Alto" { \voiceTwo \alto }
    >>
    \new Staff = "lower" \with { midiInstrument = "church organ" } {
      \clef bass
      \new Voice = "Bass" { \bass }
    }
  >>
  \layout { }
  \midi { \context { \Score midiChannelMapping = #'voice } }
}
