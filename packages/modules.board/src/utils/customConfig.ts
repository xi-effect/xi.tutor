/* eslint-disable @typescript-eslint/no-explicit-any */

export type { TColorOption } from './boardColors';
export {
  BOARD_COLORS,
  colorOptions,
  borderColorOptions,
  DEFAULT_BG_COLOR,
  DEFAULT_BORDER_COLOR,
} from './boardColors';

/*
This is necessary because if we set hiddenUi to the
Draw components, all keyboard shortcuts will be hidden as well,
and you'll have to add them by handling keydown events,
which is very time-consuming and not optimized.
*/

export const hiddenComponents: Required<any> = {
  ContextMenu: null,
  ActionsMenu: null,
  CursorChatBubble: null,
  HelpMenu: null,
  ZoomMenu: null,
  MainMenu: null,
  Minimap: null,
  StylePanel: null,
  PageMenu: null,
  NavigationPanel: null,
  Toolbar: null,
  KeyboardShortcutsDialog: null,
  QuickActions: null,
  HelperButtons: null,
  DebugPanel: null,
  DebugMenu: null,
  SharePanel: null,
  MenuPanel: null,
  ImageToolbar: null,
  TopPanel: null,
};

export const DEFAULT_FILL_TYPE = 'semi';

/*
This example shows how you can replace tldraw's default keyboard shortcuts with your own,
or add a shortcut for an action that doesn't have one. An example of how to add shortcuts
for custom tools or default tools.

You can describe modifier keys with the following syntax:

shift: !
 ctrl/cmd: $
 alt: ?

*/
// const overrides: DrUiOverrides = {
//   actions(_editor, actions): DrUiActionsContextType {
//     const newActions = {
//       ...actions,
//       'toggle-grid': { ...actions['toggle-grid'], kbd: 'x' },
//       'copy-as-png': { ...actions['copy-as-png'], kbd: '$1' },
//     };

//     return newActions;
//   },
//   tools(_editor, tools): DrUiToolsContextType {
//     const newTools = { ...tools, draw: { ...tools.draw, kbd: 'p' } };
//     return newTools;
//   },
// };
