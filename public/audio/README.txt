Cassette player — audio source
===============================

Planned source: YouTube (to be wired up later).

The "now playing" cassette widget in index-os.html is fully built — transport
controls, seekable progress, spinning reels, and a 5-track playlist. It just
needs audio hooked up. Right now the 5 tracks are placeholders (no sound).

When you're ready to do YouTube
-------------------------------
1. Get each song's YouTube video ID (the v=XXXXXXXXXXX part of the URL).
2. Put the IDs into the `tracks` array in index-os.html
   (search for "Playlist: 5 songs").
3. The playback engine then swaps from the <audio> element to the YouTube
   IFrame Player API — the existing controls/progress/playlist UI are reused.

Local-file fallback (optional)
------------------------------
If you'd rather host files instead of using YouTube, drop track1.mp3 ...
track5.mp3 into this folder and set each track's `src` to
"audio/track1.mp3" etc. — the cassette will play them inline with no other
changes.

Either way, update the `title` / `artist` fields in that same array to show
the real song names.
