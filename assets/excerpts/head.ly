\version "2.26.0"
\pointAndClickOff
#(set-global-staff-size 18)
\header { tagline = ##f }
\paper {
  paper-width = 190\mm
  paper-height = 48\mm
  top-margin = 3\mm
  bottom-margin = 3\mm
  left-margin = 3\mm
  right-margin = 3\mm
  ragged-last-bottom = ##t
  print-page-number = ##f
}
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #1 }

semanticNote = #(define-music-function (ident voice measure) (string? string? number?)
  #{
    \once \override NoteHead.output-attributes =
      #`((id . ,ident) (data-note-id . ,ident) (data-voice . ,voice) (data-measure . ,measure))
    \once \override Rest.output-attributes =
      #`((id . ,ident) (data-note-id . ,ident) (data-voice . ,voice) (data-measure . ,measure))
  #})
aMusic = \absolute {
  \global
  \clef alto
  \override Stem.output-attributes = #'((data-voice . "a"))
  \override Beam.output-attributes = #'((data-voice . "a"))
  \override Flag.output-attributes = #'((data-voice . "a"))
  \override Accidental.output-attributes = #'((data-voice . "a"))
  \override Tie.output-attributes = #'((data-voice . "a"))
  \override Dots.output-attributes = #'((data-voice . "a"))
  \override LaissezVibrerTie.output-attributes = #'((data-voice . "a"))
  \override RepeatTie.output-attributes = #'((data-voice . "a"))
  % Original measure 1
  \semanticNote "fig-head-a-m1-n1" "a" #1 d'8
  \semanticNote "fig-head-a-m1-n2" "a" #1 c'8
  \semanticNote "fig-head-a-m1-n3" "a" #1 b8
  \semanticNote "fig-head-a-m1-n4" "a" #1 a8
  \semanticNote "fig-head-a-m1-n5" "a" #1 c'4
  \semanticNote "fig-head-a-m1-n6" "a" #1 e'8
  \semanticNote "fig-head-a-m1-n7" "a" #1 d'8~
  |
  % Original measure 2
  \semanticNote "fig-head-a-m2-n1" "a" #2 d'4
  \semanticNote "fig-head-a-m2-n2" "a" #2 e'8
  \semanticNote "fig-head-a-m2-n3" "a" #2 f'8
  \semanticNote "fig-head-a-m2-n4" "a" #2 g'4
  \semanticNote "fig-head-a-m2-n5" "a" #2 f'8
  \semanticNote "fig-head-a-m2-n6" "a" #2 e'8
  \once \omit Score.BarNumber
  |
}
\score {
  \new StaffGroup <<
    \new Staff \with { instrumentName = "A" shortInstrumentName = "A" } { \aMusic }
  >>
  \layout {
    indent = 7\mm
    ragged-right = ##f
    \context {
      \Score
      barNumberVisibility = #all-bar-numbers-visible
      \override BarNumber.break-visibility = ##(#t #t #t)
      \override BarNumber.font-size = #-1
      \override SpacingSpanner.uniform-stretching = ##t
    }
    \context { \Staff \override VerticalAxisGroup.staff-staff-spacing.basic-distance = #16 }
  }
  \midi { \tempo 4 = 92 \context { \Score midiChannelMapping = #'voice } }
}
