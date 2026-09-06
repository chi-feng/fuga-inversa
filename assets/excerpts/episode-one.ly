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
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #7 }

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
  % Original measure 7
  \semanticNote "fig-episode-one-s-m7-n1" "s" #7 f'8
  \semanticNote "fig-episode-one-s-m7-n2" "s" #7 e'16
  \semanticNote "fig-episode-one-s-m7-n3" "s" #7 f'16
  \semanticNote "fig-episode-one-s-m7-n4" "s" #7 g'8
  \semanticNote "fig-episode-one-s-m7-n5" "s" #7 f'16
  \semanticNote "fig-episode-one-s-m7-n6" "s" #7 g'16
  \semanticNote "fig-episode-one-s-m7-n7" "s" #7 e'8
  \semanticNote "fig-episode-one-s-m7-n8" "s" #7 d'16
  \semanticNote "fig-episode-one-s-m7-n9" "s" #7 e'16
  \semanticNote "fig-episode-one-s-m7-n10" "s" #7 f'8
  \semanticNote "fig-episode-one-s-m7-n11" "s" #7 e'16
  \semanticNote "fig-episode-one-s-m7-n12" "s" #7 f'16
  |
  % Original measure 8
  \semanticNote "fig-episode-one-s-m8-n1" "s" #8 f'8
  \semanticNote "fig-episode-one-s-m8-n2" "s" #8 e'16
  \semanticNote "fig-episode-one-s-m8-n3" "s" #8 f'16
  \semanticNote "fig-episode-one-s-m8-n4" "s" #8 e'4~
  \semanticNote "fig-episode-one-s-m8-n5" "s" #8 e'4
  \semanticNote "fig-episode-one-s-m8-n6" "s" #8 fis'4
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
  % Original measure 7
  \semanticNote "fig-episode-one-a-m7-n1" "a" #7 d'4
  \semanticNote "fig-episode-one-a-m7-n2" "a" #7 bes4
  \semanticNote "fig-episode-one-a-m7-n3" "a" #7 g4
  \semanticNote "fig-episode-one-a-m7-n4" "a" #7 a4
  |
  % Original measure 8
  \semanticNote "fig-episode-one-a-m8-n1" "a" #8 d'4
  \semanticNote "fig-episode-one-a-m8-n2" "a" #8 bes4
  \semanticNote "fig-episode-one-a-m8-n3" "a" #8 a8
  \semanticNote "fig-episode-one-a-m8-n4" "a" #8 cis'8
  \semanticNote "fig-episode-one-a-m8-n5" "a" #8 a4
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
  % Original measure 7
  \semanticNote "fig-episode-one-b-m7-n1" "b" #7 d4
  \semanticNote "fig-episode-one-b-m7-n2" "b" #7 g,4
  \semanticNote "fig-episode-one-b-m7-n3" "b" #7 c4
  \semanticNote "fig-episode-one-b-m7-n4" "b" #7 f,4
  |
  % Original measure 8
  \semanticNote "fig-episode-one-b-m8-n1" "b" #8 bes,4
  \semanticNote "fig-episode-one-b-m8-n2" "b" #8 g,4
  \semanticNote "fig-episode-one-b-m8-n3" "b" #8 a,4
  \semanticNote "fig-episode-one-b-m8-n4" "b" #8 d4
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
