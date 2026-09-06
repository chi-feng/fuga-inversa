\version "2.26.0"
\score {
  \new PianoStaff <<
    \new Staff = "RH" <<
      \new Voice = "Soprano" { \voiceOne g''4 a'' b'' c''' }
      \new Voice = "Alto" { \voiceTwo e''4 f'' g'' a'' }
    >>
    \new Staff = "LH" { \clef bass \new Voice = "Bass" { c4 d e f } }
  >>
  \midi { \context { \Score midiChannelMapping = #'voice } }
}
