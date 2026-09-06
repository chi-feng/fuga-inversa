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
global = { \key d \minor \time 4/4 \set Score.currentBarNumber = #15 }

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
  % Original measure 15
  \semanticNote "fig-suspensions-s-m15-n1" "s" #15 a'4
  \semanticNote "fig-suspensions-s-m15-n2" "s" #15 bes'8
  \semanticNote "fig-suspensions-s-m15-n3" "s" #15 a'8
  \semanticNote "fig-suspensions-s-m15-n4" "s" #15 g'4
  \semanticNote "fig-suspensions-s-m15-n5" "s" #15 e'8
  \semanticNote "fig-suspensions-s-m15-n6" "s" #15 f'8
  |
  % Original measure 16
  \semanticNote "fig-suspensions-s-m16-n1" "s" #16 a'4
  \semanticNote "fig-suspensions-s-m16-n2" "s" #16 bes'8
  \semanticNote "fig-suspensions-s-m16-n3" "s" #16 c''8
  \semanticNote "fig-suspensions-s-m16-n4" "s" #16 d''4
  \semanticNote "fig-suspensions-s-m16-n5" "s" #16 c''8
  \semanticNote "fig-suspensions-s-m16-n6" "s" #16 bes'8
  |
  % Original measure 17
  \semanticNote "fig-suspensions-s-m17-n1" "s" #17 a'4~
  \semanticNote "fig-suspensions-s-m17-n2" "s" #17 a'8
  \semanticNote "fig-suspensions-s-m17-n3" "s" #17 g'8~
  \semanticNote "fig-suspensions-s-m17-n4" "s" #17 g'2
  |
  % Original measure 18
  \semanticNote "fig-suspensions-s-m18-n1" "s" #18 f'4~
  \semanticNote "fig-suspensions-s-m18-n2" "s" #18 f'8
  \semanticNote "fig-suspensions-s-m18-n3" "s" #18 e'8
  \semanticNote "fig-suspensions-s-m18-n4" "s" #18 e'8
  \semanticNote "fig-suspensions-s-m18-n5" "s" #18 a'8
  \semanticNote "fig-suspensions-s-m18-n6" "s" #18 cis''8
  \semanticNote "fig-suspensions-s-m18-n7" "s" #18 b'16
  \semanticNote "fig-suspensions-s-m18-n8" "s" #18 cis''16
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
  % Original measure 15
  \semanticNote "fig-suspensions-a-m15-n1" "a" #15 f'4
  \semanticNote "fig-suspensions-a-m15-n2" "a" #15 f'8
  \semanticNote "fig-suspensions-a-m15-n3" "a" #15 c'8
  \semanticNote "fig-suspensions-a-m15-n4" "a" #15 bes4
  \semanticNote "fig-suspensions-a-m15-n5" "a" #15 bes8
  \semanticNote "fig-suspensions-a-m15-n6" "a" #15 a8
  |
  % Original measure 16
  \semanticNote "fig-suspensions-a-m16-n1" "a" #16 c'4
  \semanticNote "fig-suspensions-a-m16-n2" "a" #16 ees'8
  \semanticNote "fig-suspensions-a-m16-n3" "a" #16 ees'8
  \semanticNote "fig-suspensions-a-m16-n4" "a" #16 d'4
  \semanticNote "fig-suspensions-a-m16-n5" "a" #16 f'8
  \semanticNote "fig-suspensions-a-m16-n6" "a" #16 e'8
  |
  % Original measure 17
  \semanticNote "fig-suspensions-a-m17-n1" "a" #17 f'4
  \semanticNote "fig-suspensions-a-m17-n2" "a" #17 d'4
  \semanticNote "fig-suspensions-a-m17-n3" "a" #17 bes8
  \semanticNote "fig-suspensions-a-m17-n4" "a" #17 b8
  \semanticNote "fig-suspensions-a-m17-n5" "a" #17 cis'4
  |
  % Original measure 18
  \semanticNote "fig-suspensions-a-m18-n1" "a" #18 d'4
  \semanticNote "fig-suspensions-a-m18-n2" "a" #18 g8
  \semanticNote "fig-suspensions-a-m18-n3" "a" #18 b8
  \semanticNote "fig-suspensions-a-m18-n4" "a" #18 cis'4
  \semanticNote "fig-suspensions-a-m18-n5" "a" #18 e'4
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
  % Original measure 15
  \semanticNote "fig-suspensions-b-m15-n1" "b" #15 f8
  \semanticNote "fig-suspensions-b-m15-n2" "b" #15 ees8
  \semanticNote "fig-suspensions-b-m15-n3" "b" #15 d8
  \semanticNote "fig-suspensions-b-m15-n4" "b" #15 c8
  \semanticNote "fig-suspensions-b-m15-n5" "b" #15 ees4
  \semanticNote "fig-suspensions-b-m15-n6" "b" #15 g8
  \semanticNote "fig-suspensions-b-m15-n7" "b" #15 f8~
  |
  % Original measure 16
  \semanticNote "fig-suspensions-b-m16-n1" "b" #16 f4
  \semanticNote "fig-suspensions-b-m16-n2" "b" #16 g8
  \semanticNote "fig-suspensions-b-m16-n3" "b" #16 a8
  \semanticNote "fig-suspensions-b-m16-n4" "b" #16 bes4
  \semanticNote "fig-suspensions-b-m16-n5" "b" #16 a8
  \semanticNote "fig-suspensions-b-m16-n6" "b" #16 g8
  |
  % Original measure 17
  \semanticNote "fig-suspensions-b-m17-n1" "b" #17 f4
  \semanticNote "fig-suspensions-b-m17-n2" "b" #17 bes,4
  \semanticNote "fig-suspensions-b-m17-n3" "b" #17 g,4
  \semanticNote "fig-suspensions-b-m17-n4" "b" #17 a,4
  |
  % Original measure 18
  \semanticNote "fig-suspensions-b-m18-n1" "b" #18 d4
  \semanticNote "fig-suspensions-b-m18-n2" "b" #18 e4
  \semanticNote "fig-suspensions-b-m18-n3" "b" #18 a,2
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
