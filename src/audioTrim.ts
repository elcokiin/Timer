const TARGET_SECONDS = 3;
const WINDOW_MS = 24;
const SILENCE_RMS = 0.012;
const SILENCE_PEAK = 0.035;

function findFirstAudibleSample(buffer: AudioBuffer): number {
  const channels = Math.max(1, buffer.numberOfChannels);
  const frameSize = Math.max(128, Math.floor((buffer.sampleRate * WINDOW_MS) / 1000));
  const totalSamples = buffer.length;

  for (let start = 0; start < totalSamples; start += frameSize) {
    const end = Math.min(totalSamples, start + frameSize);
    const count = Math.max(1, end - start);
    let maxPeak = 0;
    let sumSquares = 0;

    for (let ch = 0; ch < channels; ch += 1) {
      const data = buffer.getChannelData(ch);
      for (let i = start; i < end; i += 1) {
        const value = Math.abs(data[i] ?? 0);
        if (value > maxPeak) maxPeak = value;
        sumSquares += value * value;
      }
    }

    const rms = Math.sqrt(sumSquares / (count * channels));
    if (rms >= SILENCE_RMS || maxPeak >= SILENCE_PEAK) {
      return start;
    }
  }

  return 0;
}

function encodeWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = samples * blockAlign;
  const wav = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wav);

  let offset = 0;
  const writeStr = (str: string) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
    offset += str.length;
  };

  writeStr("RIFF");
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeStr("WAVE");
  writeStr("fmt ");
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, channels, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeStr("data");
  view.setUint32(offset, dataSize, true);
  offset += 4;

  for (let i = 0; i < samples; i += 1) {
    for (let ch = 0; ch < channels; ch += 1) {
      const sample = buffer.getChannelData(ch)?.[i] ?? 0;
      const clamped = Math.max(-1, Math.min(1, sample));
      const int = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, int, true);
      offset += 2;
    }
  }

  return new Blob([wav], { type: "audio/wav" });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function stripFileExtension(fileName: string): string {
  const trimmed = fileName.trim();
  if (!trimmed) return "Audio";
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return trimmed;
  return trimmed.slice(0, dot) || "Audio";
}

export async function trimAlarmToAudibleThreeSeconds(file: File): Promise<string> {
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const ctx = new Ctx();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const startSample = findFirstAudibleSample(decoded);
    const startTime = startSample / decoded.sampleRate;
    const available = Math.max(0.08, decoded.duration - startTime);
    const duration = Math.min(TARGET_SECONDS, available);
    const sampleCount = Math.max(1, Math.floor(duration * decoded.sampleRate));
    const out = new AudioBuffer({
      length: sampleCount,
      numberOfChannels: decoded.numberOfChannels,
      sampleRate: decoded.sampleRate,
    });

    for (let ch = 0; ch < decoded.numberOfChannels; ch += 1) {
      const src = decoded.getChannelData(ch);
      const dst = out.getChannelData(ch);
      for (let i = 0; i < sampleCount; i += 1) {
        const srcIndex = Math.min(decoded.length - 1, startSample + i);
        dst[i] = src[srcIndex] ?? 0;
      }
    }

    const wavBlob = encodeWav(out);
    return await blobToDataURL(wavBlob);
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } finally {
    await ctx.close().catch(() => {});
  }
}
