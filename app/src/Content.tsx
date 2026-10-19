import PDFPanel from './PDFPanel';
import './Content.css';
import type { DroppedPdf } from './FilesBar';

function Content({
  selectedFile,
  requestId,
  closeRequests,
  onCloseRequestComplete,
}: {
  selectedFile: DroppedPdf | null;
  requestId: number;
  closeRequests: { id: number; file: DroppedPdf }[];
  onCloseRequestComplete: (id: number) => void;
}) {
  return (
    <div id="content">
      <PDFPanel
        file={selectedFile}
        requestId={requestId}
        closeRequests={closeRequests}
        onCloseRequestComplete={onCloseRequestComplete}
      />
    </div>
  );
}

export default Content;