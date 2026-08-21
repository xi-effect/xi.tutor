import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { downloadFileRequest, useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCallback } from 'react';
import { DropdownMenuItem, DropdownMenuSeparator } from '@xipkg/dropdown';
import { useNodeActiveBlock, useProtectedImage, useYjsContext } from '../../hooks';
import { MediaBlockMenu } from '../media/MediaBlockMenu';
import { AudioPlayer } from './AudioPlayer';
import { parseBooleanAttr } from './audioTypes';

function isResolvedSrc(src: string) {
  return src.startsWith('blob:') || src.startsWith('http') || src.startsWith('data:');
}

const settingsItemClass = 'hover:bg-background-page h-auto rounded p-1 text-sm';

export const AudioNodeView = ({ node, getPos, updateAttributes }: NodeViewProps) => {
  const { t } = useTranslation('editor');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { editor, storageToken, isReadOnly } = useYjsContext();
  const getActiveBlock = useNodeActiveBlock(editor, getPos, 'audio');
  const blobUrl = useProtectedImage(node.attrs.src, storageToken);
  const nodeId = String(node.attrs.id || node.attrs.src || '');

  const syncPlayback = parseBooleanAttr(node.attrs.syncPlayback, false);
  const studentsCanAddTimecodes = parseBooleanAttr(node.attrs.studentsCanAddTimecodes, false);
  const timecodesVisibleByDefault = parseBooleanAttr(node.attrs.timecodesVisibleByDefault, true);
  const studentsCanControlPlayback = parseBooleanAttr(node.attrs.studentsCanControlPlayback, false);

  const handleDownload = () => {
    if (!node.attrs.src || !storageToken) return;
    toast.success(t('media.downloadStarted'));
    void downloadFileRequest({
      fileId: node.attrs.src,
      fileName: node.attrs.fileName || 'audio',
      token: storageToken,
    });
  };

  const updateAttrs = useCallback(
    (attrs: Record<string, unknown>) => {
      updateAttributes(attrs);
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper className="group relative my-3" contentEditable={false}>
      {!node.attrs.src || !isResolvedSrc(blobUrl) ? (
        <div className="bg-background-surface border-border-default text-text-disabled flex h-20 items-center justify-center rounded-xl border text-sm">
          {t('audio.loading')}
        </div>
      ) : (
        <AudioPlayer
          nodeId={nodeId}
          attrs={node.attrs}
          blobUrl={blobUrl}
          isReadOnly={isReadOnly}
          updateAttributes={updateAttrs}
        />
      )}
      <MediaBlockMenu
        editor={editor}
        getActiveBlock={getActiveBlock}
        isReadOnly={isReadOnly}
        onDownload={handleDownload}
        extraItems={
          isTutor && !isReadOnly ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={settingsItemClass}
                onSelect={() =>
                  updateAttributes({
                    syncPlayback: !syncPlayback,
                    studentsCanControlPlayback: false,
                  })
                }
              >
                {syncPlayback ? t('audio.localPlayback') : t('audio.syncPlayback')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={settingsItemClass}
                onSelect={() =>
                  updateAttributes({ studentsCanAddTimecodes: !studentsCanAddTimecodes })
                }
              >
                {studentsCanAddTimecodes
                  ? t('audio.forbidStudentTimecodes')
                  : t('audio.allowStudentTimecodes')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={settingsItemClass}
                onSelect={() =>
                  updateAttributes({ timecodesVisibleByDefault: !timecodesVisibleByDefault })
                }
              >
                {timecodesVisibleByDefault
                  ? t('audio.hideNewTimecodes')
                  : t('audio.showNewTimecodes')}
              </DropdownMenuItem>
              {syncPlayback && (
                <DropdownMenuItem
                  className={settingsItemClass}
                  onSelect={() =>
                    updateAttributes({
                      studentsCanControlPlayback: !studentsCanControlPlayback,
                    })
                  }
                >
                  {studentsCanControlPlayback ? t('audio.forbidControl') : t('audio.allowControl')}
                </DropdownMenuItem>
              )}
            </>
          ) : null
        }
      />
    </NodeViewWrapper>
  );
};
