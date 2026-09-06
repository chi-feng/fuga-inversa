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
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #13 }

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
  % Original measure 13
  \semanticNote "fig-episode-two-s-m13-n1" "s" #13 e''4
  \semanticNote "fig-episode-two-s-m13-n2" "s" #13 f''4
  \semanticNote "fig-episode-two-s-m13-n3" "s" #13 d''4
  \semanticNote "fig-episode-two-s-m13-n4" "s" #13 ees''4
  |
  % Original measure 14
  \semanticNote "fig-episode-two-s-m14-n1" "s" #14 c''4
  \semanticNote "fig-episode-two-s-m14-n2" "s" #14 d''4
  \semanticNote "fig-episode-two-s-m14-n3" "s" #14 bes'4
  \semanticNote "fig-episode-two-s-m14-n4" "s" #14 c''4
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
  % Original measure 13
  \semanticNote "fig-episode-two-a-m13-n1" "a" #13 g'8
  \semanticNote "fig-episode-two-a-m13-n2" "a" #13 f'16
  \semanticNote "fig-episode-two-a-m13-n3" "a" #13 g'16
  \semanticNote "fig-episode-two-a-m13-n4" "a" #13 a'8
  \semanticNote "fig-episode-two-a-m13-n5" "a" #13 g'16
  \semanticNote "fig-episode-two-a-m13-n6" "a" #13 a'16
  \semanticNote "fig-episode-two-a-m13-n7" "a" #13 f'8
  \semanticNote "fig-episode-two-a-m13-n8" "a" #13 e'16
  \semanticNote "fig-episode-two-a-m13-n9" "a" #13 f'16
  \semanticNote "fig-episode-two-a-m13-n10" "a" #13 g'8
  \semanticNote "fig-episode-two-a-m13-n11" "a" #13 f'16
  \semanticNote "fig-episode-two-a-m13-n12" "a" #13 g'16
  |
  % Original measure 14
  \semanticNote "fig-episode-two-a-m14-n1" "a" #14 e'8
  \semanticNote "fig-episode-two-a-m14-n2" "a" #14 d'16
  \semanticNote "fig-episode-two-a-m14-n3" "a" #14 e'16
  \semanticNote "fig-episode-two-a-m14-n4" "a" #14 f'8
  \semanticNote "fig-episode-two-a-m14-n5" "a" #14 e'16
  \semanticNote "fig-episode-two-a-m14-n6" "a" #14 f'16
  \semanticNote "fig-episode-two-a-m14-n7" "a" #14 d'8
  \semanticNote "fig-episode-two-a-m14-n8" "a" #14 c'16
  \semanticNote "fig-episode-two-a-m14-n9" "a" #14 d'16
  \semanticNote "fig-episode-two-a-m14-n10" "a" #14 e'8
  \semanticNote "fig-episode-two-a-m14-n11" "a" #14 d'16
  \semanticNote "fig-episode-two-a-m14-n12" "a" #14 e'16
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
  % Original measure 13
  \semanticNote "fig-episode-two-b-m13-n1" "b" #13 c'4
  \semanticNote "fig-episode-two-b-m13-n2" "b" #13 f4
  \semanticNote "fig-episode-two-b-m13-n3" "b" #13 bes,4
  \semanticNote "fig-episode-two-b-m13-n4" "b" #13 ees4
  |
  % Original measure 14
  \semanticNote "fig-episode-two-b-m14-n1" "b" #14 a,4
  \semanticNote "fig-episode-two-b-m14-n2" "b" #14 d4
  \semanticNote "fig-episode-two-b-m14-n3" "b" #14 g,4
  \semanticNote "fig-episode-two-b-m14-n4" "b" #14 c4
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
