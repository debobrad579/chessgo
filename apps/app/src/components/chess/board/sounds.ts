type SoundType = "move" | "capture"

class SoundManager {
  private context: AudioContext | null = null
  private buffers: Partial<Record<SoundType, AudioBuffer>> = {}
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.initPromise != null) {
      await this.initPromise
      if (this.context?.state === "suspended") {
        await this.context.resume()
      }
      return
    }

    this.initPromise = (async () => {
      this.context ??= new AudioContext()

      await this.context.resume()

      const [move, capture] = await Promise.all([
        this.load("/sounds/move.mp3"),
        this.load("/sounds/capture.mp3"),
      ])

      this.buffers = { move, capture }
    })()

    try {
      await this.initPromise
    } catch (error) {
      this.initPromise = null
      throw error
    }
  }

  private async load(url: string): Promise<AudioBuffer> {
    if (this.context == null) {
      throw new Error("AudioContext is not initialized")
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load ${url}`)
    }

    return this.context.decodeAudioData(await response.arrayBuffer())
  }

  async play(type: SoundType): Promise<void> {
    if (
      typeof navigator !== "undefined" &&
      !navigator.userActivation?.hasBeenActive
    ) {
      return
    }

    await this.init()

    const buffer = this.buffers[type]
    if (
      buffer == null ||
      this.context == null ||
      this.context.state !== "running"
    ) {
      return
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.connect(this.context.destination)
    source.start()
  }
}

export const sounds = new SoundManager()
