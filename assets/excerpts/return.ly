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
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #19 }

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
  % Original measure 19
  \semanticNote "fig-return-s-m19-n1" "s" #19 d''8
  \semanticNote "fig-return-s-m19-n2" "s" #19 c''8
  \semanticNote "fig-return-s-m19-n3" "s" #19 b'8
  \semanticNote "fig-return-s-m19-n4" "s" #19 a'8
  \semanticNote "fig-return-s-m19-n5" "s" #19 c''4
  \semanticNote "fig-return-s-m19-n6" "s" #19 e''8
  \semanticNote "fig-return-s-m19-n7" "s" #19 d''8~
  |
  % Original measure 20
  \semanticNote "fig-return-s-m20-n1" "s" #20 d''4
  \semanticNote "fig-return-s-m20-n2" "s" #20 bes'4
  \semanticNote "fig-return-s-m20-n3" "s" #20 a'4
  \semanticNote "fig-return-s-m20-n4" "s" #20 g'4
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
  % Original measure 19
  \semanticNote "fig-return-a-m19-n1" "a" #19 r8
  \semanticNote "fig-return-a-m19-n2" "a" #19 a'8
  \semanticNote "fig-return-a-m19-n3" "a" #19 g'8
  \semanticNote "fig-return-a-m19-n4" "a" #19 fis'8
  \semanticNote "fig-return-a-m19-n5" "a" #19 e'8
  \semanticNote "fig-return-a-m19-n6" "a" #19 g'4
  \semanticNote "fig-return-a-m19-n7" "a" #19 b'8
  |
  % Original measure 20
  \semanticNote "fig-return-a-m20-n1" "a" #20 a'8
  \semanticNote "fig-return-a-m20-n2" "a" #20 g'8
  \semanticNote "fig-return-a-m20-n3" "a" #20 f'8
  \semanticNote "fig-return-a-m20-n4" "a" #20 e'8
  \semanticNote "fig-return-a-m20-n5" "a" #20 d'4
  \semanticNote "fig-return-a-m20-n6" "a" #20 cis'4
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
  % Original measure 19
  \semanticNote "fig-return-b-m19-n1" "b" #19 f4
  \semanticNote "fig-return-b-m19-n2" "b" #19 g8
  \semanticNote "fig-return-b-m19-n3" "b" #19 d8
  \semanticNote "fig-return-b-m19-n4" "b" #19 c4.
  \semanticNote "fig-return-b-m19-n5" "b" #19 g8
  |
  % Original measure 20
  \semanticNote "fig-return-b-m20-n1" "b" #20 f4
  \semanticNote "fig-return-b-m20-n2" "b" #20 d8
  \semanticNote "fig-return-b-m20-n3" "b" #20 g8
  \semanticNote "fig-return-b-m20-n4" "b" #20 f4
  \semanticNote "fig-return-b-m20-n5" "b" #20 a,4
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
