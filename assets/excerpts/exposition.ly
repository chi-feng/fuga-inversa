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
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #3 }

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
  % Original measure 3
  \semanticNote "fig-exposition-s-m3-n1" "s" #3 a'8
  \semanticNote "fig-exposition-s-m3-n2" "s" #3 g'8
  \semanticNote "fig-exposition-s-m3-n3" "s" #3 fis'8
  \semanticNote "fig-exposition-s-m3-n4" "s" #3 e'8
  \semanticNote "fig-exposition-s-m3-n5" "s" #3 g'4
  \semanticNote "fig-exposition-s-m3-n6" "s" #3 b'8
  \semanticNote "fig-exposition-s-m3-n7" "s" #3 a'8~
  |
  % Original measure 4
  \semanticNote "fig-exposition-s-m4-n1" "s" #4 a'4
  \semanticNote "fig-exposition-s-m4-n2" "s" #4 b'8
  \semanticNote "fig-exposition-s-m4-n3" "s" #4 c''8
  \semanticNote "fig-exposition-s-m4-n4" "s" #4 d''4
  \semanticNote "fig-exposition-s-m4-n5" "s" #4 c''8
  \semanticNote "fig-exposition-s-m4-n6" "s" #4 a'8
  |
  % Original measure 5
  \semanticNote "fig-exposition-s-m5-n1" "s" #5 f'4
  \semanticNote "fig-exposition-s-m5-n2" "s" #5 g'8
  \semanticNote "fig-exposition-s-m5-n3" "s" #5 f'8
  \semanticNote "fig-exposition-s-m5-n4" "s" #5 e'4
  \semanticNote "fig-exposition-s-m5-n5" "s" #5 cis'8
  \semanticNote "fig-exposition-s-m5-n6" "s" #5 d'8
  |
  % Original measure 6
  \semanticNote "fig-exposition-s-m6-n1" "s" #6 f'4
  \semanticNote "fig-exposition-s-m6-n2" "s" #6 g'8
  \semanticNote "fig-exposition-s-m6-n3" "s" #6 a'8
  \semanticNote "fig-exposition-s-m6-n4" "s" #6 bes'4
  \semanticNote "fig-exposition-s-m6-n5" "s" #6 a'8
  \semanticNote "fig-exposition-s-m6-n6" "s" #6 g'8
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
  % Original measure 3
  \semanticNote "fig-exposition-a-m3-n1" "a" #3 c'4
  \semanticNote "fig-exposition-a-m3-n2" "a" #3 d'8
  \semanticNote "fig-exposition-a-m3-n3" "a" #3 c'8
  \semanticNote "fig-exposition-a-m3-n4" "a" #3 b4
  \semanticNote "fig-exposition-a-m3-n5" "a" #3 gis8
  \semanticNote "fig-exposition-a-m3-n6" "a" #3 a8
  |
  % Original measure 4
  \semanticNote "fig-exposition-a-m4-n1" "a" #4 c'4
  \semanticNote "fig-exposition-a-m4-n2" "a" #4 d'8
  \semanticNote "fig-exposition-a-m4-n3" "a" #4 e'8
  \semanticNote "fig-exposition-a-m4-n4" "a" #4 f'4
  \semanticNote "fig-exposition-a-m4-n5" "a" #4 e'8
  \semanticNote "fig-exposition-a-m4-n6" "a" #4 cis'8
  |
  % Original measure 5
  \semanticNote "fig-exposition-a-m5-n1" "a" #5 d'4
  \semanticNote "fig-exposition-a-m5-n2" "a" #5 d'8
  \semanticNote "fig-exposition-a-m5-n3" "a" #5 c'8
  \semanticNote "fig-exposition-a-m5-n4" "a" #5 g4
  \semanticNote "fig-exposition-a-m5-n5" "a" #5 g8
  \semanticNote "fig-exposition-a-m5-n6" "a" #5 f8
  |
  % Original measure 6
  \semanticNote "fig-exposition-a-m6-n1" "a" #6 a4
  \semanticNote "fig-exposition-a-m6-n2" "a" #6 c'8
  \semanticNote "fig-exposition-a-m6-n3" "a" #6 c'8
  \semanticNote "fig-exposition-a-m6-n4" "a" #6 bes4
  \semanticNote "fig-exposition-a-m6-n5" "a" #6 c'8
  \semanticNote "fig-exposition-a-m6-n6" "a" #6 cis'8
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
  % Original measure 3
  \semanticNote "fig-exposition-b-m3-n1" "b" #3 r1
  |
  % Original measure 4
  \semanticNote "fig-exposition-b-m4-n1" "b" #4 r1
  |
  % Original measure 5
  \semanticNote "fig-exposition-b-m5-n1" "b" #5 d8
  \semanticNote "fig-exposition-b-m5-n2" "b" #5 c8
  \semanticNote "fig-exposition-b-m5-n3" "b" #5 b,8
  \semanticNote "fig-exposition-b-m5-n4" "b" #5 a,8
  \semanticNote "fig-exposition-b-m5-n5" "b" #5 c4
  \semanticNote "fig-exposition-b-m5-n6" "b" #5 e8
  \semanticNote "fig-exposition-b-m5-n7" "b" #5 d8~
  |
  % Original measure 6
  \semanticNote "fig-exposition-b-m6-n1" "b" #6 d4
  \semanticNote "fig-exposition-b-m6-n2" "b" #6 e8
  \semanticNote "fig-exposition-b-m6-n3" "b" #6 f8
  \semanticNote "fig-exposition-b-m6-n4" "b" #6 g4
  \semanticNote "fig-exposition-b-m6-n5" "b" #6 f8
  \semanticNote "fig-exposition-b-m6-n6" "b" #6 e8
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
