% Deliberately invalid hand allocation: the alto transfer before bar 11 is omitted.
\version "2.26.0"
\pointAndClickOff

\header {
  title = "Fuga inversa"
  subtitle = "On the inverted LICC · in three voices"
  subsubtitle = "For a single manual"
  composer = "GPT-6 Astra"
  tagline = ##f
}

\paper {
  #(set-paper-size "a4")
  top-margin = 13\mm
  bottom-margin = 13\mm
  left-margin = 17\mm
  right-margin = 17\mm
  ragged-last-bottom = ##f
  print-page-number = ##f
  system-system-spacing.basic-distance = #16
  system-system-spacing.minimum-distance = #12
}

global = { \key d \minor \time 4/4 }
tempoMusic = {
  \tempo "Andante con moto" 4 = 92
  s1*25
  \tag #'midi { \tempo 4 = 60 }
  s1
}

soprano = {
  \tag #'layout { \oneVoice \hideNotes }
  r1 | % 1
  r1 | % 2
  \tag #'layout { \unHideNotes }
  a'8 g'8 fis'8 e'8 g'4 b'8 a'8~ | % 3
  a'4 b'8 c''8 d''4 c''8 a'8 | % 4
  \tag #'layout { \voiceOne }
  f'4 g'8 f'8 e'4 cis'8 d'8 | % 5
  f'4 g'8 a'8 bes'4 a'8 g'8 | % 6
  f'8 e'16 f'16 g'8 f'16 g'16 e'8 d'16 e'16 f'8 e'16 f'16 | % 7
  f'8 e'16 f'16 e'4~ e'4 fis'4 | % 8
  g'8 f'8 e'8 d'8 f'4
  \tag #'layout { \oneVoice }
  a'8 g'8~ | % 9
  \tag #'layout { \voiceOne }
  g'4 a'8 bes'8 c''4 d''8 c''8 | % 10
  \tag #'layout { \oneVoice }
  e''4 f''8 e''8 d''4 b'8 c''8 | % 11
  e''4 f''8 g''8~ g''8 f''8 g''8 f''8 | % 12
  \tag #'layout { \voiceOne }
  e''4 f''4 d''4 ees''4 | % 13
  c''4 d''4 bes'4 c''4 | % 14
  a'4 bes'8 a'8 g'4 e'8 f'8 | % 15
  a'4 bes'8 c''8 d''4 c''8 bes'8 | % 16
  a'4~ a'8 g'8~ g'2 | % 17
  f'4~ f'8 e'8 e'8 a'8 cis''8 b'16 cis''16 | % 18
  d''8 c''8 b'8 a'8 c''4 e''8 d''8~ | % 19
  d''4 bes'4 a'4 g'4 | % 20
  f'4 g'8 f'8 e'4 cis'8 d'8 | % 21
  f'4 g'8 a'8 bes'4 a'8 g'8 | % 22
  f'4 e'8 d'8 e'4 f'8 g'8 | % 23
  f'2 ees'2 | % 24
  \tag #'layout { \oneVoice }
  d'4 cis'4 e'8 a'8 cis''8 e''8 | % 25
  d''1\fermata | % 26
}

alto = {
  \tag #'layout { \oneVoice }
  d'8 c'8 b8 a8 c'4 e'8 d'8~ | % 1
  d'4 e'8 f'8 g'4 f'8 e'8 | % 2
  \tag #'layout { \change Staff = "lower" \voiceOne }
  c'4 d'8 c'8 b4 gis8 a8 | % 3
  c'4 d'8 e'8 f'4 e'8 cis'8 | % 4
  \tag #'layout { \change Staff = "upper" \voiceTwo }
  d'4 d'8 c'8 g4 g8 f8 | % 5
  a4 c'8 c'8 bes4 c'8 cis'8 | % 6
  d'4 bes4 g4 a4 | % 7
  d'4 bes4 a8 cis'8 a4 | % 8
  bes4 c'8 bes8 a4
  \tag #'layout { \change Staff = "lower" \voiceOne }
  fis8 g8 | % 9
  \tag #'layout { \change Staff = "upper" \voiceTwo }
  bes4 a8 d'8 e'4 g'8 e'8 | % 10
  c'8 bes8 a8 g8 bes4 d'8 c'8~ | % 11
  c'4 d'8 e'8 f'4 e'8 d'8 | % 12
  \tag #'layout { \change Staff = "upper" \voiceTwo }
  g'8 f'16 g'16 a'8 g'16 a'16 f'8 e'16 f'16 g'8 f'16 g'16 | % 13
  e'8 d'16 e'16 f'8 e'16 f'16 d'8 c'16 d'16 e'8 d'16 e'16 | % 14
  f'4 f'8 c'8 bes4 bes8 a8 | % 15
  c'4 ees'8 ees'8 d'4 f'8 e'8 | % 16
  f'4 d'4 bes8 b8 cis'4 | % 17
  d'4 g8 b8 cis'4 e'4 | % 18
  r8 a'8 g'8 fis'8 e'8 g'4 b'8 | % 19
  a'8 g'8 f'8 e'8 d'4 cis'4 | % 20
  d'4 d'8 c'8 g4 g8 f8 | % 21
  a4 c'8 c'8 bes4 c'8 cis'8 | % 22
  d'4 c'8 g8 g4 d'8 c'8 | % 23
  d'2 bes2 | % 24
  \tag #'layout { \change Staff = "lower" \voiceOne }
  f4 e2. | % 25
  fis1\fermata | % 26
}

bass = {
  \tag #'layout { \oneVoice }
  r1 | % 1
  r1 | % 2
  \tag #'layout { \hideNotes \clef treble }
  r1 | % 3
  r1 | % 4
  \tag #'layout { \unHideNotes \clef bass }
  d8 c8 b,8 a,8 c4 e8 d8~ | % 5
  d4 e8 f8 g4 f8 e8 | % 6
  d4 g,4 c4 f,4 | % 7
  bes,4 g,4 a,4 d4 | % 8
  g,4 a,8 bes,8
  \tag #'layout { \voiceTwo }
  d4. bes,8 | % 9
  \tag #'layout { \oneVoice }
  g,4 f,8 bes,8 a,4 b,8 c8 | % 10
  \tag #'layout { \voiceTwo }
  c4 d8 e8 g4. e8 | % 11
  c4 f8 e8 a4 c'8 b8 | % 12
  \tag #'layout { \oneVoice }
  c'4 f4 bes,4 ees4 | % 13
  a,4 d4 g,4 c4 | % 14
  f8 ees8 d8 c8 ees4 g8 f8~ | % 15
  f4 g8 a8 bes4 a8 g8 | % 16
  f4 bes,4 g,4 a,4 | % 17
  d4 e4 a,2 | % 18
  f4 g8 d8 c4. g8 | % 19
  f4 d8 g8 f4 a,4 | % 20
  d8 c8 b,8 a,8 c4 e8 d8~ | % 21
  d4 e8 f8 g4 f8 e8 | % 22
  d4 a,8 b,8 c4 bes,8 a,8 | % 23
  d2 g,2 | % 24
  \tag #'layout { \voiceTwo }
  a,1 | % 25
  d1 | % 26
}

\score {
  \removeWithTag #'midi
  \new PianoStaff <<
    \new Staff = "upper" <<
      \global
      \tempoMusic
      \new Voice = "Soprano" { \soprano }
      \new Voice = "Alto" { \alto }
    >>
    \new Staff = "lower" <<
      \global
      \clef bass
      \new Voice = "Bass" { \bass \bar "|." }
    >>
  >>
  \layout {
    indent = 0\mm
    \context { \Score \override BarNumber.font-size = #-1 }
    \context { \PianoStaff \override StaffGrouper.staff-staff-spacing.basic-distance = #10 }
  }
}

% Separate MIDI staves preserve voice identity across printed hand transfers.
\score {
  \removeWithTag #'layout
  <<
    \new Staff \with { midiInstrument = "church organ" } <<
      \global \tempoMusic \new Voice { \soprano }
    >>
    \new Staff \with { midiInstrument = "church organ" } { \global \alto }
    \new Staff \with { midiInstrument = "church organ" } { \global \bass }
  >>
  \midi { \context { \Score midiChannelMapping = #'voice } }
}
