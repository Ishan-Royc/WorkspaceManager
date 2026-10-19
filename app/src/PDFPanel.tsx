import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { useEffect, useRef, useState } from 'react';
import type { DroppedPdf } from './FilesBar';
import './PDFPanel.css';

function PDFPanel({
  file,
  requestId,
  closeRequests,
  onCloseRequestComplete,
}: {
  file: DroppedPdf | null;
  requestId: number;
  closeRequests: { id: number; file: DroppedPdf }[];
  onCloseRequestComplete: (id: number) => void;
}) {
  const viewerRef = useRef<any>(null);
  const documentManagerRef = useRef<any>(null);
  const documentIdsByFile = useRef(new Map<DroppedPdf, Set<string>>());
  const removedFiles = useRef(new Set<DroppedPdf>());
  const processedCloseRequests = useRef(new Set<number>());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) return;

    let cancelled = false;

    void (async () => {
      try {
        const buffer = await file.file.arrayBuffer();
        const registry = await viewerRef.current.registry;

        if (cancelled) return;

        const documentManager = registry.getPlugin('document-manager').provides();
        documentManagerRef.current = documentManager;
        const { documentId } = await documentManager.openDocumentBuffer({
          buffer,
          name: file.name,
          autoActivate: true,
        }).toPromise();

        if (cancelled || removedFiles.current.has(file)) {
          await documentManager.closeDocument(documentId).toPromise();
        } else {
          const documentIds = documentIdsByFile.current.get(file) ?? new Set();
          documentIds.add(documentId);
          documentIdsByFile.current.set(file, documentIds);
        }

        setError('');
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, requestId]);

  useEffect(() => {
    for (const request of closeRequests) {
      if (processedCloseRequests.current.has(request.id)) continue;
      processedCloseRequests.current.add(request.id);
      removedFiles.current.add(request.file);

      void (async () => {
        try {
          const documentManager = documentManagerRef.current;
          const documentIds = documentIdsByFile.current.get(request.file);

          if (documentManager && documentIds) {
            await Promise.all(
              [...documentIds].map(documentId =>
                documentManager.closeDocument(documentId).toPromise(),
              ),
            );
            documentIdsByFile.current.delete(request.file);
          }
        } catch (cause) {
          setError(
            cause instanceof Error ? cause.message : String(cause),
          );
        } finally {
          onCloseRequestComplete(request.id);
        }
      })();
    }
  }, [closeRequests, onCloseRequestComplete]);

  return (
    <div id="pdf-panel">
      {error && <p role="alert">{error}</p>}
      <div id="pdf-panel-content">
        <PDFViewer
          ref={viewerRef}
          config={{
            theme: { preference: 'light' },
            documentManager: { maxDocuments: 10 },
          }}
        />
      </div>
    </div>
  );
}

export default PDFPanel;