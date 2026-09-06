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
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #23 }

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
  % Original measure 23
  \semanticNote "fig-coda-s-m23-n1" "s" #23 f'4
  \semanticNote "fig-coda-s-m23-n2" "s" #23 e'8
  \semanticNote "fig-coda-s-m23-n3" "s" #23 d'8
  \semanticNote "fig-coda-s-m23-n4" "s" #23 e'4
  \semanticNote "fig-coda-s-m23-n5" "s" #23 f'8
  \semanticNote "fig-coda-s-m23-n6" "s" #23 g'8
  |
  % Original measure 24
  \semanticNote "fig-coda-s-m24-n1" "s" #24 f'2
  \semanticNote "fig-coda-s-m24-n2" "s" #24 ees'2
  |
  % Original measure 25
  \semanticNote "fig-coda-s-m25-n1" "s" #25 d'4
  \semanticNote "fig-coda-s-m25-n2" "s" #25 cis'4
  \semanticNote "fig-coda-s-m25-n3" "s" #25 e'8
  \semanticNote "fig-coda-s-m25-n4" "s" #25 a'8
  \semanticNote "fig-coda-s-m25-n5" "s" #25 cis''8
  \semanticNote "fig-coda-s-m25-n6" "s" #25 e''8
  |
  % Original measure 26
  \semanticNote "fig-coda-s-m26-n1" "s" #26 d''1\fermata
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
  % Original measure 23
  \semanticNote "fig-coda-a-m23-n1" "a" #23 d'4
  \semanticNote "fig-coda-a-m23-n2" "a" #23 c'8
  \semanticNote "fig-coda-a-m23-n3" "a" #23 g8
  \semanticNote "fig-coda-a-m23-n4" "a" #23 g4
  \semanticNote "fig-coda-a-m23-n5" "a" #23 d'8
  \semanticNote "fig-coda-a-m23-n6" "a" #23 c'8
  |
  % Original measure 24
  \semanticNote "fig-coda-a-m24-n1" "a" #24 d'2
  \semanticNote "fig-coda-a-m24-n2" "a" #24 bes2
  |
  % Original measure 25
  \semanticNote "fig-coda-a-m25-n1" "a" #25 f4
  \semanticNote "fig-coda-a-m25-n2" "a" #25 e2.
  |
  % Original measure 26
  \semanticNote "fig-coda-a-m26-n1" "a" #26 fis1\fermata
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
  % Original measure 23
  \semanticNote "fig-coda-b-m23-n1" "b" #23 d4
  \semanticNote "fig-coda-b-m23-n2" "b" #23 a,8
  \semanticNote "fig-coda-b-m23-n3" "b" #23 b,8
  \semanticNote "fig-coda-b-m23-n4" "b" #23 c4
  \semanticNote "fig-coda-b-m23-n5" "b" #23 bes,8
  \semanticNote "fig-coda-b-m23-n6" "b" #23 a,8
  |
  % Original measure 24
  \semanticNote "fig-coda-b-m24-n1" "b" #24 d2
  \semanticNote "fig-coda-b-m24-n2" "b" #24 g,2
  |
  % Original measure 25
  \semanticNote "fig-coda-b-m25-n1" "b" #25 a,1
  |
  % Original measure 26
  \semanticNote "fig-coda-b-m26-n1" "b" #26 d1
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
