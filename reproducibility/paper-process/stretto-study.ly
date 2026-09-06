\version "2.26.0"
\pointAndClickOff
\header {
  title = "Stretto study"
  subtitle = "Proposed replacement of bars 19–20, with bars 18 and 21 retained"
  tagline = ##f
}
\paper { #(set-paper-size "a4") ragged-last-bottom = ##t }
global = { \key d \minor \time 4/4 \tempo 4 = 92 }
soprano = \absolute {
  f'4~ f'8 e'8 e'8 a'8 cis''8 b'16 cis''16 |
  d''8^\markup \tiny "Subject in D" c''8 b'8 a'8 c''4 e''8 d''8~ |
  d''4 bes'4 a'4 g'4 |
  f'4 g'8 f'8 e'4 cis'8 d'8 \bar "||"
}
alto = \absolute {
  d'4 g8 b8 cis'4 e'4 |
  r8 a'8_\markup \tiny "Real answer, one eighth later" g'8 fis'8 e'8 g'4 b'8 |
  a'8 g'8 f'8 e'8 d'4 cis'4 |
  d'4 d'8 c'8 g4 g8 f8
}
bass = \absolute {
  d4 e4 a,2 |
  f4 g8 d8 c4. g8 |
  f4 d8 g8 f4 a,4 |
  d8 c8 b,8 a,8 c4 e8 d8
}
\score {
  \new PianoStaff <<
    \new Staff = "upper" \with { midiInstrument = "church organ" } <<
      \global
      \new Voice = "Soprano" { \voiceOne \soprano }
      \new Voice = "Alto" { \voiceTwo \alto }
    >>
    \new Staff = "lower" \with { midiInstrument = "church organ" } <<
      \global \clef bass
      \new Voice = "Bass" { \oneVoice \bass }
    >>
  >>
  \layout { }
  \midi { \context { \Score midiChannelMapping = #'voice } }
}
