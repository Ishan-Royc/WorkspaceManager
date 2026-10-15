import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import './PDFPanel.css';

function PDFPanel({file}: {file: string}) {

  return (
    <>
      <div id="pdf-panel">
        <div id="pdf-panel-content">
          <PDFViewer
            key={file}
            config={{
              src: file,
              theme: { preference: 'light' }
             }}
          />
        </div>
      </div>
    </>
  )
}

export default PDFPanel
