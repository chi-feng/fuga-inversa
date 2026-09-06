\version "2.26.0"
\pointAndClickOff
#(set-global-staff-size 21)

\header { tagline = ##f }
\paper {
  paper-width = 148\mm
  paper-height = 70\mm
  top-margin = 3\mm
  bottom-margin = 3\mm
  left-margin = 3\mm
  right-margin = 3\mm
  ragged-last-bottom = ##t
  print-page-number = ##f
}

liccMusic = \absolute {
  \clef treble
  \time 4/4
  d'8[ e'8 f'8 g'8] e'4 c'8[ d'8] \bar "|."
}

inversionMusic = \absolute {
  \clef treble
  \time 4/4
  d'8[ c'8 b!8 a8] c'4 e'8[ d'8] \bar "|."
}

\score {
  \new StaffGroup <<
    \new Staff \with { instrumentName = "LICC" } {
      \new Voice = "LICC" { \liccMusic }
    }
    \new Staff \with { instrumentName = "Inversion" } {
      \new Voice = "Inversion" { \inversionMusic }
    }
  >>
  \layout {
    indent = 26\mm
    ragged-right = ##f
    \context {
      \Score
      \omit BarNumber
      \override SpacingSpanner.uniform-stretching = ##t
    }
    \context {
      \Staff
      \override VerticalAxisGroup.staff-staff-spacing.basic-distance = #17
    }
  }
  \midi {
    \tempo 4 = 92
    \context { \Score midiChannelMapping = #'voice }
  }
}
