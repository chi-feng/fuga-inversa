\version "2.26.0"
\pointAndClickOff
\header {
  title = "Fuga sopra il LICC inverso"
  subtitle = "Three voices · one manual · no pedals"
  composer = "Candidate C"
  tagline = ##f
}
\paper {
  #(set-paper-size "a4")
  top-margin = 13\mm
  bottom-margin = 13\mm
  ragged-last-bottom = ##f
}
global = { \key d \minor \time 4/4 \tempo "Andante con moto" 4 = 92 }
soprano = {
  r1 | % 1
  r1 | % 2
  a'8 g'8 fis'8 e'8 g'4 b'8 a'8~ | % 3
  a'4 b'8 c''8 d''4 c''8 a'8 | % 4
  f'4 g'8 f'8 e'4 cis'8 d'8 | % 5
  f'4 g'8 a'8 bes'4 a'8 g'8 | % 6
  f'8 e'16 f'16 g'8 f'16 g'16 e'8 d'16 e'16 f'8 e'16 f'16 | % 7
  f'8 e'16 f'16 e'4~ e'4 fis'4 | % 8
  g'8 f'8 e'8 d'8 f'4 a'8 g'8~ | % 9
  g'4 a'8 bes'8 c''4 d''8 c''8 | % 10
  e''4 f''8 e''8 d''4 b'8 c''8 | % 11
  e''4 f''8 g''8~ g''8 f''8 g''8 f''8 | % 12
  e''4 f''4 d''4 ees''4 | % 13
  c''4 d''4 bes'4 c''4 | % 14
  a'4 bes'8 a'8 g'4 e'8 f'8 | % 15
  a'4 bes'8 c''8 d''4 c''8 bes'8 | % 16
  a'4~ a'8 g'8~ g'2 | % 17
  f'4~ f'8 e'8 e'8 a'8 cis''8 b'16 cis''16 | % 18
  d''8 c''8 b'8 a'8 c''4 e''8 d''8~ | % 19
  d''4 c''8 bes'8 a'4 g'4 | % 20
  f'4 g'8 f'8 e'4 cis'8 d'8 | % 21
  f'4 g'8 a'8 bes'4 a'8 g'8 | % 22
  f'4 e'8 d'8 e'4 f'8 g'8 | % 23
  f'2 ees'2 | % 24
  d'4 cis'4 e'8 d'16 cis'16 e'8 cis'8 | % 25
  d'1\fermata | % 26
}

alto = {
  d'8 c'8 b8 a8 c'4 e'8 d'8~ | % 1
  d'4 e'8 f'8 g'4 f'8 e'8 | % 2
  c'4 d'8 c'8 b4 gis8 a8 | % 3
  c'4 d'8 e'8 f'4 e'8 cis'8 | % 4
  d'4 d'8 c'8 g4 g8 f8 | % 5
  a4 c'8 c'8 bes4 c'8 cis'8 | % 6
  d'4 bes4 g4 a4 | % 7
  d'4 bes4 a8 cis'8 a4 | % 8
  bes4 c'8 bes8 a4 fis8 g8 | % 9
  bes4 a8 d'8 e'4 g'8 e'8 | % 10
  c'8 bes8 a8 g8 bes4 d'8 c'8~ | % 11
  c'4 d'8 e'8 f'4 e'8 d'8 | % 12
  g'8 f'16 g'16 a'8 g'16 a'16 f'8 e'16 f'16 g'8 f'16 g'16 | % 13
  e'8 d'16 e'16 f'8 e'16 f'16 d'8 c'16 d'16 e'8 d'16 e'16 | % 14
  f'4 f'8 c'8 bes4 bes8 a8 | % 15
  c'4 ees'8 ees'8 d'4 f'8 e'8 | % 16
  f'4 d'4 bes8 b8 cis'4 | % 17
  d'4 g8 b8 cis'4 e'4 | % 18
  f'4 g'8 f'8 e'4 cis'8 d'8 | % 19
  f'4 e'8 d'8 cis'2 | % 20
  d'4 d'8 c'8 g4 g8 f8 | % 21
  a4 c'8 c'8 bes4 c'8 cis'8 | % 22
  d'4 c'8 g8 g4 d'8 c'8 | % 23
  d'2 bes2 | % 24
  f4 e2. | % 25
  fis1\fermata | % 26
}

bass = {
  r1 | % 1
  r1 | % 2
  r1 | % 3
  r1 | % 4
  d8 c8 b,8 a,8 c4 e8 d8~ | % 5
  d4 e8 f8 g4 f8 e8 | % 6
  d4 g,4 c4 f,4 | % 7
  bes,4 g,4 a,4 d4 | % 8
  g,4 a,8 bes,8 d4. bes,8 | % 9
  g,4 f,8 bes,8 a,4 b,8 c8 | % 10
  c4 d8 e8 g4. e8 | % 11
  c4 f8 e8 a4 c'8 b8 | % 12
  c'4 f4 bes,4 ees4 | % 13
  a,4 d4 g,4 c4 | % 14
  f8 ees8 d8 c8 ees4 g8 f8~ | % 15
  f4 g8 a8 bes4 a8 g8 | % 16
  f4 bes,4 g,4 a,4 | % 17
  d4 e4 a,2 | % 18
  d4 e8 f8 a4. f8 | % 19
  d4 a,8 d8 a,2 | % 20
  d8 c8 b,8 a,8 c4 e8 d8~ | % 21
  d4 e8 f8 g4 f8 e8 | % 22
  d4 a,8 b,8 c4 bes,8 a,8 | % 23
  d2 g,2 | % 24
  a,1 | % 25
  d1\fermata | % 26
}
\score {
  \new PianoStaff \with { instrumentName = "Manual" } <<
    \new Staff = "upper" \with { midiInstrument = "church organ" } <<
      \global
      \new Voice = "Soprano" { \voiceOne \soprano }
      \new Voice = "Alto" { \voiceTwo \alto }
    >>
    \new Staff = "lower" \with { midiInstrument = "church organ" } <<
      \global
      \clef bass
      \new Voice = "Bass" { \oneVoice \bass \bar "|." }
    >>
  >>
  \layout { }
  \midi { \context { \Score midiChannelMapping = #'voice } }
}
