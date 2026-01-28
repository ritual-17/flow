export type TextID = string;

export type Location = {
  x: number;
  y: number;
};

export type TextFormatting = {
  fontFamily?: string;
  fontSize?: number; // px
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string; // css color string
  align?: 'left' | 'center' | 'right';
};

export type TextObject = {
  id: TextID;
  position: Location;
  content: string;
  formatting?: TextFormatting;
};

export class InvalidLocationError extends Error {
  public readonly name = 'InvalidLocationError';
  constructor(message = 'Invalid Location') {
    super(message);
  }
}

export class TextNotFoundError extends Error {
  public readonly name = 'TextNotFoundError';
  constructor(message = 'Text Not Found') {
    super(message);
  }
}


export class TextBuffer {
  private readonly text: Map<TextID, TextObject> = new Map();

  private nextId = 1;

  public createText(location: Location, content: string, formatting?: TextFormatting): TextID {
    this.assertValidLocation(location);

    const id = this.generateTextID();
    const obj: TextObject = this.freezeTextObject({
      id,
      position: { x: location.x, y: location.y },
      content: content ?? '',
      formatting: formatting ? { ...formatting } : undefined,
    });

    this.text.set(id, obj);
    return id;
  }

  public modifyText(id: TextID, content: string): void {
    const existing = this.text.get(id);
    if (!existing) throw new TextNotFoundError();

    const updated: TextObject = this.freezeTextObject({
      ...existing,
      content: content ?? '',
    });

    this.text.set(id, updated);
  }

  public moveText(id: TextID, newLocation: Location): TextObject {
    this.assertValidLocation(newLocation);

    const existing = this.text.get(id);
    if (!existing) throw new TextNotFoundError();

    const updated: TextObject = this.freezeTextObject({
      ...existing,
      position: { x: newLocation.x, y: newLocation.y },
    });

    this.text.set(id, updated);
    return updated;
  }

  public deleteText(id: TextID): void {
    if (!this.text.has(id)) throw new TextNotFoundError();
    this.text.delete(id);
  }

  private generateTextID(): TextID {
    const cryptoAny = globalThis as unknown as { crypto?: { randomUUID?: () => string } };

    if (cryptoAny.crypto?.randomUUID) {
      return cryptoAny.crypto.randomUUID();
    }

    const id = `t_${Date.now()}_${this.nextId}_${Math.floor(Math.random() * 1e9)}`;
    this.nextId += 1;
    return id;
  }

  private assertValidLocation(location: Location): void {
    const ok =
      location &&
      Number.isFinite(location.x) &&
      Number.isFinite(location.y);

    if (!ok) throw new InvalidLocationError();
  }

  private freezeTextObject(obj: TextObject): TextObject {
    if (obj.formatting) Object.freeze(obj.formatting);
    Object.freeze(obj.position);
    return Object.freeze(obj);
  }
}

export const textBuffer = new TextBuffer();
