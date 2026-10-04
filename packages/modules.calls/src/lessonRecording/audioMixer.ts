export type MixerAudioSource = {
  id: string;
  track: MediaStreamTrack;
};

/**
 * Сводит несколько аудиотреков в один, не останавливая исходные.
 * Mute и замена устройства приходят сами: мы держим ссылку на живой трек LiveKit
 * и только отключаем узел графа, когда публикация исчезла.
 */
export class ConferenceAudioMixer {
  private readonly context: AudioContext;
  private readonly destination: MediaStreamAudioDestinationNode;
  private readonly nodes = new Map<string, MediaStreamAudioSourceNode>();
  private readonly keepAlive: AudioScheduledSourceNode;
  private readonly keepAliveGain: GainNode;

  constructor() {
    const scope = globalThis as typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctx = scope.AudioContext || scope.webkitAudioContext;
    if (!Ctx) {
      throw new Error('AudioContext is not available');
    }
    this.context = new Ctx();
    this.destination = this.context.createMediaStreamDestination();
    this.keepAliveGain = this.context.createGain();
    this.keepAliveGain.gain.value = 0;
    this.keepAliveGain.connect(this.destination);
    const constant = this.context.createConstantSource?.bind(this.context);
    this.keepAlive = constant ? constant() : this.context.createOscillator();
    this.keepAlive.connect(this.keepAliveGain);
    this.keepAlive.start();
  }

  get isRunning(): boolean {
    return this.context.state === 'running';
  }

  get audioTrack(): MediaStreamTrack {
    const [track] = this.destination.stream.getAudioTracks();
    if (!track) throw new Error('Audio mixer has no destination track');
    return track;
  }

  async resume(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  sync(sources: MixerAudioSource[]): void {
    const nextIds = new Set(sources.map((source) => source.id));
    for (const [id, node] of this.nodes) {
      if (nextIds.has(id)) continue;
      node.disconnect();
      this.nodes.delete(id);
    }

    for (const source of sources) {
      if (this.nodes.has(source.id)) continue;
      if (source.track.readyState === 'ended') continue;
      const node = this.context.createMediaStreamSource(new MediaStream([source.track]));
      node.connect(this.destination);
      this.nodes.set(source.id, node);
    }
  }

  async close(): Promise<void> {
    for (const node of this.nodes.values()) node.disconnect();
    this.nodes.clear();
    try {
      this.keepAlive.stop();
    } catch {
      // Уже остановлен вместе с контекстом.
    }
    this.keepAlive.disconnect();
    this.keepAliveGain.disconnect();
    const [destinationTrack] = this.destination.stream.getAudioTracks();
    destinationTrack?.stop();
    await this.context.close();
  }
}
