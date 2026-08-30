Cassette player — audio source
===============================

Source: YouTube. This is wired up and playing; nothing here is a placeholder.

The "now playing" cassette widget has transport controls, a seekable progress
bar, spinning reels and a 5-track playlist. Playback runs through the YouTube
IFrame Player API. There is no <audio> element and no local-file path any more,
so this folder holds no audio — it is kept only for this note.

Changing the playlist
---------------------
The tracks live in the `tracks` array inside initCassette() in src/os.js
(search for "var tracks"). NOT in index-os.html — the markup moved out to
src/os.js and src/os.css a while back.

Paste the whole YouTube link into `yt`; a watch URL, a youtu.be short link,
/shorts/, /embed/ or the bare 11-character ID all work. Set `title` and
`artist` to the real song names, because the video itself is never shown and
those two fields are all a visitor sees.

Two things to know
------------------
1. An album or playlist link has no video ID in it, so it will not play. Open
   the album and take the link to the single track you want.

2. Not every video allows embedding, and permission can vary by country.
   A blocked track is skipped automatically and the widget only says
   "mixtape unavailable" if every track fails. Worth checking a new link
   actually plays rather than assuming.
