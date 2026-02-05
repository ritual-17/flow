import { FlowFile } from './FlowFile';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function assertFlowFile(data: unknown): asserts data is FlowFile {
  if (!isRecord(data)) {
    throw new Error('Unsupported or invalid Flow file');
  }

  // version
  if (!('version' in data) || data.version !== 1) {
    throw new Error('Unsupported or invalid Flow file');
  }

  // shapes
  if (!('shapes' in data) || !Array.isArray(data.shapes)) {
    throw new Error('Invalid shapes');
  }
}
