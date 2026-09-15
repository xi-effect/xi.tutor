import type { ContentInterpreter, VisualizationSuggestion } from '../types';
import { getVisualizationSuggestions } from '../getVisualizationSuggestions';

export class DeterministicContentInterpreter implements ContentInterpreter {
  interpretSync(content: string): VisualizationSuggestion[] {
    return getVisualizationSuggestions(content);
  }

  interpret(content: string): Promise<VisualizationSuggestion[]> {
    return Promise.resolve(this.interpretSync(content));
  }
}

export class LocalLLMContentInterpreter implements ContentInterpreter {
  interpret(): Promise<VisualizationSuggestion[]> {
    return Promise.resolve([]);
  }
}

export class CloudLLMContentInterpreter implements ContentInterpreter {
  interpret(): Promise<VisualizationSuggestion[]> {
    return Promise.resolve([]);
  }
}

export class CompositeContentInterpreter implements ContentInterpreter {
  constructor(private readonly interpreters: ContentInterpreter[]) {}

  async interpret(content: string): Promise<VisualizationSuggestion[]> {
    const groups = await Promise.all(
      this.interpreters.map((interpreter) => interpreter.interpret(content).catch(() => [])),
    );
    const merged = new Map<string, VisualizationSuggestion>();
    for (const suggestion of groups.flat()) {
      const key = `${suggestion.intent.type}:${suggestion.summary}`;
      const existing = merged.get(key);
      if (!existing || suggestion.confidence > existing.confidence) {
        merged.set(key, suggestion);
      }
    }
    return [...merged.values()].sort((left, right) => right.confidence - left.confidence);
  }
}

let defaultInterpreter: ContentInterpreter = new DeterministicContentInterpreter();

export function getContentInterpreter(): ContentInterpreter {
  return defaultInterpreter;
}

export function setContentInterpreter(interpreter: ContentInterpreter): void {
  defaultInterpreter = interpreter;
}

export const deterministicContentInterpreter = new DeterministicContentInterpreter();
