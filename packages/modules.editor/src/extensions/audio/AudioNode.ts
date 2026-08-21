import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { AudioNodeView } from './AudioNodeView';
import { DEFAULT_AUDIO_ATTRS, parseBooleanAttr, parseTimecodes } from './audioTypes';

export const AudioNode = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      fileName: { default: '' },
      fileSize: { default: 0 },
      duration: { default: 0 },
      syncPlayback: {
        default: DEFAULT_AUDIO_ATTRS.syncPlayback,
        parseHTML: (element) => parseBooleanAttr(element.getAttribute('data-sync-playback'), false),
        renderHTML: (attributes) => ({
          'data-sync-playback': attributes.syncPlayback ? 'true' : 'false',
        }),
      },
      studentsCanAddTimecodes: {
        default: DEFAULT_AUDIO_ATTRS.studentsCanAddTimecodes,
        parseHTML: (element) =>
          parseBooleanAttr(element.getAttribute('data-students-can-add-timecodes'), false),
        renderHTML: (attributes) => ({
          'data-students-can-add-timecodes': attributes.studentsCanAddTimecodes ? 'true' : 'false',
        }),
      },
      timecodesVisibleByDefault: {
        default: DEFAULT_AUDIO_ATTRS.timecodesVisibleByDefault,
        parseHTML: (element) =>
          parseBooleanAttr(element.getAttribute('data-timecodes-visible-by-default'), true),
        renderHTML: (attributes) => ({
          'data-timecodes-visible-by-default': attributes.timecodesVisibleByDefault
            ? 'true'
            : 'false',
        }),
      },
      studentsCanControlPlayback: {
        default: DEFAULT_AUDIO_ATTRS.studentsCanControlPlayback,
        parseHTML: (element) =>
          parseBooleanAttr(element.getAttribute('data-students-can-control-playback'), false),
        renderHTML: (attributes) => ({
          'data-students-can-control-playback': attributes.studentsCanControlPlayback
            ? 'true'
            : 'false',
        }),
      },
      timecodes: {
        default: DEFAULT_AUDIO_ATTRS.timecodes,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-timecodes');
          if (!raw) return [];
          try {
            return parseTimecodes(JSON.parse(raw));
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          'data-timecodes': JSON.stringify(attributes.timecodes ?? []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="audio"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'audio' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView);
  },
});
