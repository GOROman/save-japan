(function () {
  let context;
  let master;
  let musicTimer;
  let musicRunning = false;
  const midiCache = new Map();

  function init() {
    if (!context) {
      context = new (window.AudioContext || window.webkitAudioContext)();
      master = context.createGain();
      master.gain.value = 0.2;
      master.connect(context.destination);
    }
    if (context.state === "suspended") context.resume();
  }

  const frequency = (note) => 440 * 2 ** ((note - 69) / 12);
  function tone(
    note,
    duration = 0.1,
    type = "square",
    volume = 0.1,
    delay = 0,
  ) {
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency(note);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.002, volume),
      start + 0.008,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function readVariable(data, cursor) {
    let value = 0;
    let byte;
    do {
      byte = data[cursor.offset++];
      value = (value << 7) | (byte & 0x7f);
    } while (byte & 0x80);
    return value;
  }

  async function loadMidi(url) {
    if (midiCache.has(url)) return midiCache.get(url);
    const data = new Uint8Array(await (await fetch(url)).arrayBuffer());
    const view = new DataView(data.buffer);
    const ticks = view.getUint16(12);
    const trackCount = view.getUint16(10);
    let offset = 14;
    const events = [];
    for (let track = 0; track < trackCount; track++) {
      offset += 4;
      const length = view.getUint32(offset);
      offset += 4;
      const end = offset + length;
      const cursor = { offset };
      let tick = 0;
      let status = 0;
      while (cursor.offset < end) {
        tick += readVariable(data, cursor);
        let byte = data[cursor.offset++];
        if (byte < 0x80) cursor.offset--;
        else status = byte;
        if (status === 0xff) {
          const type = data[cursor.offset++];
          const size = readVariable(data, cursor);
          if (type === 0x51 && size === 3) {
            const tempo =
              (data[cursor.offset] << 16) |
              (data[cursor.offset + 1] << 8) |
              data[cursor.offset + 2];
            events.push({ tick, tempo });
          }
          cursor.offset += size;
        } else if (status === 0xf0 || status === 0xf7) {
          cursor.offset += readVariable(data, cursor);
        } else {
          const command = status & 0xf0;
          const channel = status & 0x0f;
          const note = data[cursor.offset++];
          const velocity =
            command === 0xc0 || command === 0xd0 ? 0 : data[cursor.offset++];
          if (command === 0x90 && velocity)
            events.push({ tick, note, velocity, channel });
        }
      }
      offset = end;
    }
    events.sort((a, b) => a.tick - b.tick);
    let tempo = 500000;
    let lastTick = 0;
    let seconds = 0;
    const notes = [];
    for (const event of events) {
      seconds += ((event.tick - lastTick) * tempo) / ticks / 1e6;
      lastTick = event.tick;
      if (event.tempo) tempo = event.tempo;
      else notes.push({ ...event, time: seconds });
    }
    const result = { notes, duration: Math.max(0.8, seconds + 0.6) };
    midiCache.set(url, result);
    return result;
  }

  async function playMidi(name, volume = 0.1) {
    init();
    try {
      const midi = await loadMidi(`/assets/audio/${name}.mid`);
      midi.notes.forEach((event) =>
        tone(
          event.note,
          event.channel === 9 ? 0.035 : 0.12,
          event.channel === 9 ? "sawtooth" : "square",
          (volume * event.velocity) / 127,
          event.time,
        ),
      );
      return midi.duration;
    } catch (error) {
      console.warn("MIDI playback fallback", error);
      tone(76, 0.12, "square", volume);
      return 1;
    }
  }

  async function startMusic() {
    init();
    if (musicRunning) return;
    musicRunning = true;
    const loop = async () => {
      if (!musicRunning) return;
      const duration = await playMidi("save-japan-bgm-60s", 0.045);
      musicTimer = setTimeout(loop, duration * 1000);
    };
    loop();
  }
  function stopMusic() {
    musicRunning = false;
    clearTimeout(musicTimer);
  }

  window.SaveJapanAudio = {
    init,
    startMusic,
    stopMusic,
    laser: () => playMidi("sfx-laser", 0.12),
    launch: () => playMidi("sfx-launch", 0.13),
    alert: () => playMidi("sfx-mission-alert", 0.14),
    hissatsu: () => playMidi("sfx-hissatsu", 0.16),
    victory: () => {
      stopMusic();
      return playMidi("sfx-victory", 0.14);
    },
  };
})();
