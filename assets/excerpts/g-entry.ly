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
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #9 }

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
  % Original measure 9
  \semanticNote "fig-g-entry-s-m9-n1" "s" #9 g'8
  \semanticNote "fig-g-entry-s-m9-n2" "s" #9 f'8
  \semanticNote "fig-g-entry-s-m9-n3" "s" #9 e'8
  \semanticNote "fig-g-entry-s-m9-n4" "s" #9 d'8
  \semanticNote "fig-g-entry-s-m9-n5" "s" #9 f'4
  \semanticNote "fig-g-entry-s-m9-n6" "s" #9 a'8
  \semanticNote "fig-g-entry-s-m9-n7" "s" #9 g'8~
  |
  % Original measure 10
  \semanticNote "fig-g-entry-s-m10-n1" "s" #10 g'4
  \semanticNote "fig-g-entry-s-m10-n2" "s" #10 a'8
  \semanticNote "fig-g-entry-s-m10-n3" "s" #10 bes'8
  \semanticNote "fig-g-entry-s-m10-n4" "s" #10 c''4
  \semanticNote "fig-g-entry-s-m10-n5" "s" #10 d''8
  \semanticNote "fig-g-entry-s-m10-n6" "s" #10 c''8
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
  % Original measure 9
  \semanticNote "fig-g-entry-a-m9-n1" "a" #9 bes4
  \semanticNote "fig-g-entry-a-m9-n2" "a" #9 c'8
  \semanticNote "fig-g-entry-a-m9-n3" "a" #9 bes8
  \semanticNote "fig-g-entry-a-m9-n4" "a" #9 a4
  \semanticNote "fig-g-entry-a-m9-n5" "a" #9 fis8
  \semanticNote "fig-g-entry-a-m9-n6" "a" #9 g8
  |
  % Original measure 10
  \semanticNote "fig-g-entry-a-m10-n1" "a" #10 bes4
  \semanticNote "fig-g-entry-a-m10-n2" "a" #10 a8
  \semanticNote "fig-g-entry-a-m10-n3" "a" #10 d'8
  \semanticNote "fig-g-entry-a-m10-n4" "a" #10 e'4
  \semanticNote "fig-g-entry-a-m10-n5" "a" #10 g'8
  \semanticNote "fig-g-entry-a-m10-n6" "a" #10 e'8
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
  % Original measure 9
  \semanticNote "fig-g-entry-b-m9-n1" "b" #9 g,4
  \semanticNote "fig-g-entry-b-m9-n2" "b" #9 a,8
  \semanticNote "fig-g-entry-b-m9-n3" "b" #9 bes,8
  \semanticNote "fig-g-entry-b-m9-n4" "b" #9 d4.
  \semanticNote "fig-g-entry-b-m9-n5" "b" #9 bes,8
  |
  % Original measure 10
  \semanticNote "fig-g-entry-b-m10-n1" "b" #10 g,4
  \semanticNote "fig-g-entry-b-m10-n2" "b" #10 f,8
  \semanticNote "fig-g-entry-b-m10-n3" "b" #10 bes,8
  \semanticNote "fig-g-entry-b-m10-n4" "b" #10 a,4
  \semanticNote "fig-g-entry-b-m10-n5" "b" #10 b,8
  \semanticNote "fig-g-entry-b-m10-n6" "b" #10 c8
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
