\version "2.26.0"
\pointAndClickOff
#(set-global-staff-size 18)
\header { tagline = ##f }
\paper {
  paper-width = 190\mm
  paper-height = 94\mm
  top-margin = 3\mm
  bottom-margin = 3\mm
  left-margin = 3\mm
  right-margin = 3\mm
  ragged-last-bottom = ##t
  print-page-number = ##f
}
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #11 }

semanticNote = #(define-music-function (ident voice measure) (string? string? number?)
  #{
    \once \override NoteHead.output-attributes =
      #`((id . ,ident) (data-note-id . ,ident) (data-voice . ,voice) (data-measure . ,measure))
    \once \override Rest.output-attributes =
      #`((id . ,ident) (data-note-id . ,ident) (data-voice . ,voice) (data-measure . ,measure))
  #})
sMusic = \absolute {
  \global
  \clef treble
  \override Stem.output-attributes = #'((data-voice . "s"))
  \override Beam.output-attributes = #'((data-voice . "s"))
  \override Flag.output-attributes = #'((data-voice . "s"))
  \override Accidental.output-attributes = #'((data-voice . "s"))
  \override Tie.output-attributes = #'((data-voice . "s"))
  \override Dots.output-attributes = #'((data-voice . "s"))
  \override LaissezVibrerTie.output-attributes = #'((data-voice . "s"))
  \override RepeatTie.output-attributes = #'((data-voice . "s"))
  % Original measure 11
  \semanticNote "fig-c-entry-s-m11-n1" "s" #11 e''4
  \semanticNote "fig-c-entry-s-m11-n2" "s" #11 f''8
  \semanticNote "fig-c-entry-s-m11-n3" "s" #11 e''8
  \semanticNote "fig-c-entry-s-m11-n4" "s" #11 d''4
  \semanticNote "fig-c-entry-s-m11-n5" "s" #11 b'8
  \semanticNote "fig-c-entry-s-m11-n6" "s" #11 c''8
  |
  % Original measure 12
  \semanticNote "fig-c-entry-s-m12-n1" "s" #12 e''4
  \semanticNote "fig-c-entry-s-m12-n2" "s" #12 f''8
  \semanticNote "fig-c-entry-s-m12-n3" "s" #12 g''8~
  \semanticNote "fig-c-entry-s-m12-n4" "s" #12 g''8
  \semanticNote "fig-c-entry-s-m12-n5" "s" #12 f''8
  \semanticNote "fig-c-entry-s-m12-n6" "s" #12 g''8
  \semanticNote "fig-c-entry-s-m12-n7" "s" #12 f''8
  \once \omit Score.BarNumber
  |
}
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
  % Original measure 11
  \semanticNote "fig-c-entry-a-m11-n1" "a" #11 c'8
  \semanticNote "fig-c-entry-a-m11-n2" "a" #11 bes8
  \semanticNote "fig-c-entry-a-m11-n3" "a" #11 a8
  \semanticNote "fig-c-entry-a-m11-n4" "a" #11 g8
  \semanticNote "fig-c-entry-a-m11-n5" "a" #11 bes4
  \semanticNote "fig-c-entry-a-m11-n6" "a" #11 d'8
  \semanticNote "fig-c-entry-a-m11-n7" "a" #11 c'8~
  |
  % Original measure 12
  \semanticNote "fig-c-entry-a-m12-n1" "a" #12 c'4
  \semanticNote "fig-c-entry-a-m12-n2" "a" #12 d'8
  \semanticNote "fig-c-entry-a-m12-n3" "a" #12 e'8
  \semanticNote "fig-c-entry-a-m12-n4" "a" #12 f'4
  \semanticNote "fig-c-entry-a-m12-n5" "a" #12 e'8
  \semanticNote "fig-c-entry-a-m12-n6" "a" #12 d'8
  \once \omit Score.BarNumber
  |
}
bMusic = \absolute {
  \global
  \clef bass
  \override Stem.output-attributes = #'((data-voice . "b"))
  \override Beam.output-attributes = #'((data-voice . "b"))
  \override Flag.output-attributes = #'((data-voice . "b"))
  \override Accidental.output-attributes = #'((data-voice . "b"))
  \override Tie.output-attributes = #'((data-voice . "b"))
  \override Dots.output-attributes = #'((data-voice . "b"))
  \override LaissezVibrerTie.output-attributes = #'((data-voice . "b"))
  \override RepeatTie.output-attributes = #'((data-voice . "b"))
  % Original measure 11
  \semanticNote "fig-c-entry-b-m11-n1" "b" #11 c4
  \semanticNote "fig-c-entry-b-m11-n2" "b" #11 d8
  \semanticNote "fig-c-entry-b-m11-n3" "b" #11 e8
  \semanticNote "fig-c-entry-b-m11-n4" "b" #11 g4.
  \semanticNote "fig-c-entry-b-m11-n5" "b" #11 e8
  |
  % Original measure 12
  \semanticNote "fig-c-entry-b-m12-n1" "b" #12 c4
  \semanticNote "fig-c-entry-b-m12-n2" "b" #12 f8
  \semanticNote "fig-c-entry-b-m12-n3" "b" #12 e8
  \semanticNote "fig-c-entry-b-m12-n4" "b" #12 a4
  \semanticNote "fig-c-entry-b-m12-n5" "b" #12 c'8
  \semanticNote "fig-c-entry-b-m12-n6" "b" #12 b8
  \once \omit Score.BarNumber
  |
}
\score {
  \new StaffGroup <<
    \new Staff \with { instrumentName = "S" shortInstrumentName = "S" } { \sMusic }
    \new Staff \with { instrumentName = "A" shortInstrumentName = "A" } { \aMusic }
    \new Staff \with { instrumentName = "B" shortInstrumentName = "B" } { \bMusic }
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
