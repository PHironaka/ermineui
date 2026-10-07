import assert from 'node:assert/strict'
import { test } from 'node:test'
import { scheduleSound, soundNames } from '../../registry/ui/sound/sound.ts'

/** A stand-in for the browser's audio engine that writes down everything it is asked to play. */
function recorder() {
  const tones: Array<{ type: string; freq: number; to?: number; start: number; stop: number; peak: number; fadeEnd: number }> = []
  const param = (onSet: (value: number, time: number) => void, onRamp: (value: number, time: number) => void) => ({
    setValueAtTime: onSet,
    exponentialRampToValueAtTime: onRamp,
  })
  const audio = {
    currentTime: 10,
    createOscillator() {
      const tone = { type: 'sine', freq: 0, to: undefined as number | undefined, start: 0, stop: 0, peak: 0, fadeEnd: 0 }
      tones.push(tone)
      return {
        set type(value: string) {
          tone.type = value
        },
        frequency: param(
          (value) => (tone.freq = value),
          (value) => (tone.to = value),
        ),
        connect: (node: unknown) => node,
        start: (time: number) => (tone.start = time),
        stop: (time: number) => (tone.stop = time),
      }
    },
    createGain() {
      return {
        gain: param(
          () => {},
          (value, time) => {
            const tone = tones[tones.length - 1]!
            tone.peak = Math.max(tone.peak, value)
            tone.fadeEnd = Math.max(tone.fadeEnd, time)
          },
        ),
        connect: (node: unknown) => node,
      }
    },
  }
  return { audio: audio as unknown as BaseAudioContext, tones }
}

test('every sound is made of at least one tone and is over quickly', () => {
  for (const name of soundNames) {
    const { audio, tones } = recorder()
    scheduleSound(audio, {} as AudioNode, name)
    assert.ok(tones.length >= 1, `${name} plays something`)
    const length = Math.max(...tones.map((tone) => tone.stop)) - 10
    assert.ok(length > 0 && length <= 0.4, `${name} lasts ${length}s, which should be under 0.4s`)
  }
})

test('tones start no earlier than asked and are stopped after they have faded out', () => {
  for (const name of soundNames) {
    const { audio, tones } = recorder()
    scheduleSound(audio, {} as AudioNode, name, 25)
    for (const tone of tones) {
      assert.ok(tone.start >= 25, `${name} starts on time`)
      assert.ok(tone.stop >= tone.fadeEnd, `${name} is not cut off before its fade finishes`)
    }
  }
})

test('no sound can clip: tones playing at the same moment never add up to more than full volume', () => {
  for (const name of soundNames) {
    const { audio, tones } = recorder()
    scheduleSound(audio, {} as AudioNode, name)
    for (const tone of tones) {
      assert.ok(tone.peak > 0 && tone.peak <= 0.6, `${name} tone is audible but not loud`)
      // Loudness can only peak as a tone begins, so checking the moment each tone starts covers every case.
      const sounding = tones.filter((other) => other.start <= tone.start && other.fadeEnd > tone.start)
      assert.ok(sounding.reduce((sum, other) => sum + other.peak, 0) <= 1, `${name} stays within full volume`)
    }
  }
})

test('pitches are in the range small speakers can reproduce', () => {
  for (const name of soundNames) {
    const { audio, tones } = recorder()
    scheduleSound(audio, {} as AudioNode, name)
    for (const tone of tones) for (const pitch of [tone.freq, tone.to ?? tone.freq]) assert.ok(pitch >= 150 && pitch <= 2500, `${name} at ${pitch}Hz`)
  }
})

test('"on" rises and "off" falls, so the two can be told apart by ear', () => {
  const pitches = (name: 'on' | 'off') => {
    const { audio, tones } = recorder()
    scheduleSound(audio, {} as AudioNode, name)
    return tones.sort((a, b) => a.start - b.start).map((tone) => tone.freq)
  }
  assert.ok(pitches('on')[0]! < pitches('on')[1]!)
  assert.ok(pitches('off')[0]! > pitches('off')[1]!)
})
